"""BELLYMON V12.0.7 — original compositions, reproducible offline MP3 loops.
Requires numpy and ffmpeg. No third-party music, sounds, or samples used.
"""
import math, subprocess
from pathlib import Path
import numpy as np
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'assets'/'audio'; OUT.mkdir(parents=True,exist_ok=True)
SR=24000
RNG=np.random.default_rng(7012)

def hz(note):
    if note is None: return 0
    names={'C':0,'C#':1,'D':2,'D#':3,'E':4,'F':5,'F#':6,'G':7,'G#':8,'A':9,'A#':10,'B':11}
    key=note[:-1]; octave=int(note[-1]); midi=(octave+1)*12+names[key]
    return 440*2**((midi-69)/12)

def env(n, attack=.02, release=.18, decay=None):
    t=np.arange(n,dtype=np.float32)/SR; total=n/SR
    a=np.minimum(1.0,t/max(.001,attack))
    r=np.minimum(1.0,np.maximum(0,total-t)/max(.001,release))
    if decay: a*=np.exp(-t/decay)
    return a*r

class Loop:
    def __init__(self,bpm,bars):
        self.beat=60/bpm; self.duration=bars*4*self.beat; self.count=round(self.duration*SR)
        self.left=np.zeros(self.count,np.float32);self.right=np.zeros(self.count,np.float32)
    def add(self,at,signal,pan=0):
        if not len(signal):return
        left=math.sqrt((1-pan)/2);right=math.sqrt((1+pan)/2)
        at=int(round(at*SR))%self.count
        for part_at in range(0,len(signal),self.count):
            part=signal[part_at:part_at+self.count]
            start=(at+part_at)%self.count
            n1=min(len(part),self.count-start)
            self.left[start:start+n1]+=part[:n1]*left
            self.right[start:start+n1]+=part[:n1]*right
            if n1<len(part):
                self.left[:len(part)-n1]+=part[n1:]*left
                self.right[:len(part)-n1]+=part[n1:]*right
    def note(self,note,at,beats,kind='bell',gain=.15,pan=0):
        f=hz(note); secs=beats*self.beat
        extra={'pad':.40,'lead':.30,'bell':.24,'bass':.16,'pluck':.19}[kind]
        t=np.arange(round((secs+extra)*SR),dtype=np.float32)/SR
        phi=2*np.pi*f*t
        if kind=='pad':
            # Gently detuned orchestral synth, without external instruments.
            sig=(.57*np.sin(phi)+.21*np.sin(phi*1.005)+.18*np.sin(phi*.994)+.09*np.sin(2*phi))
            sig*=env(len(t),attack=.15,release=.42)
        elif kind=='bell':
            sig=(.69*np.sin(phi)+.22*np.sin(phi*2.002)+.13*np.sin(phi*3.997))
            sig*=env(len(t),attack=.006,release=.21,decay=.44)
        elif kind=='lead':
            vibrato=.0033*np.sin(2*np.pi*5.1*t)
            wave=np.sin(phi+vibrato*phi)+.18*np.sin(2*phi)+.06*np.sin(3*phi)
            sig=wave*env(len(t),attack=.026,release=.31)
        elif kind=='pluck':
            sig=(np.sin(phi)+.25*np.sin(2*phi)+.12*np.sin(3*phi))*env(len(t),attack=.006,release=.16,decay=.21)
        else:
            sig=(.8*np.sin(phi)+.2*np.sin(phi*2)) *env(len(t),attack=.015,release=.18)
        self.add(at,gain*sig,pan)
    def drum(self,kind,at,gain=1):
        duration={'kick':.28,'snare':.20,'hat':.065}[kind]
        t=np.arange(round(duration*SR),dtype=np.float32)/SR
        if kind=='kick':
            freq=55+125*np.exp(-t*21)
            phase=2*np.pi*np.cumsum(freq)/SR
            sound=.48*np.sin(phase)*np.exp(-t*19)
        elif kind=='snare':
            noise=RNG.standard_normal(len(t)).astype('float32')
            sound=.12*noise*np.exp(-t*22)+.10*np.sin(2*np.pi*170*t)*np.exp(-t*24)
        else:
            noise=RNG.standard_normal(len(t)).astype('float32')
            filtered=noise-np.convolve(noise,np.ones(15)/15,mode='same')
            sound=.10*filtered*np.exp(-t*62)
        self.add(at,sound*gain,pan=.1 if kind=='hat' else 0)
    def save(self,name):
        # Short, wrap-around room echoes avoid a hard discontinuity at loop seams.
        L=self.left.copy();R=self.right.copy()
        for delay,amount in [(.17,.10),(.31,.075),(.47,.045)]:
            d=round(delay*SR)
            L+=np.roll(self.right,d)*amount;R+=np.roll(self.left,d+59)*amount
        # Soft output limiter, keeping background music comfortably quieter than SFX.
        peak=max(float(abs(L).max()),float(abs(R).max()),.0001)
        L=.67*np.tanh(L*1.4/max(peak,.80));R=.67*np.tanh(R*1.4/max(peak,.80))
        stereo=np.column_stack((L,R)).astype('<f4')
        dest=OUT/name
        subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y','-f','f32le','-ar',str(SR),'-ac','2','-i','pipe:0','-codec:a','libmp3lame','-b:a','112k',str(dest)],input=stereo.tobytes(),check=True)
        print('generated',dest.name,'duration',round(self.duration,2),'s','size',round(dest.stat().st_size/1024),'KB')

def exploration():
    m=Loop(90,16); b=m.beat
    chords=[['D4','F4','A4'],['A#3','D4','F4'],['F3','A3','C4'],['C4','E4','G4'],
            ['G3','A#3','D4'],['D4','F4','A4'],['A#3','D4','F4'],['A3','C#4','E4']]*2
    roots=['D3','A#2','F2','C3','G2','D3','A#2','A2']*2
    for bar,chord in enumerate(chords):
        st=bar*4*b
        for n in chord:m.note(n,st,4,'pad',.095,pan=-.25 if n==chord[0] else .25)
        m.note(roots[bar],st,3.5,'bass',.12,pan=-.12)
        m.note(chord[1],st+2*b,1.65,'pad',.045,pan=.32)
        arp=[0,1,2,1,0,1,2,1]
        for i,k in enumerate(arp):m.note(chord[k],st+i*.5*b,.32,'bell',.075,pan=-.35 if i%2 else .35)
    melody=['D5','F5','A5','G5','F5','E5','D5','C5','D5','F5','G5','A5','G5','F5','E5','D5',
            'A4','C5','D5','F5','E5','D5','C5','A4','A4','C#5','E5','G5','E5','C#5','D5','A4']
    for bar in range(16):
        for i in range(2):
            pitch=melody[(bar*2+i)%len(melody)]
            m.note(pitch,(bar*4+i*2)*b,1.45,'lead',.105,pan=.12)
    m.save('exploration.mp3')

def battle():
    m=Loop(138,16);b=m.beat
    chords=[['A3','C4','E4'],['F3','A3','C4'],['G3','B3','D4'],['E3','G#3','B3']]*4
    roots=['A2','F2','G2','E2']*4
    melody=['A4','C5','E5','A5','G5','E5','D5','C5',
            'F5','E5','C5','A4','G4','B4','D5','E5',
            'B4','D5','G5','F5','E5','D5','B4','G4',
            'G#4','B4','E5','F5','E5','D5','B4','G#4']*2
    for bar,chord in enumerate(chords):
        st=bar*4*b
        for n in chord:m.note(n,st,3.9,'pad',.067,pan=.33 if n==chord[-1] else -.33)
        for j in range(4):
            m.note(roots[bar],st+j*b,.65,'bass',.19,pan=0)
            m.drum('kick',st+j*b,gain=.65 if j!=0 else .9)
            m.drum('hat',st+j*b+.5*b,gain=.65)
            if j in [1,3]:m.drum('snare',st+j*b,gain=.8)
        for step in range(8):
            m.note(chord[step%3],st+step*.5*b,.28,'pluck',.085,pan=.36 if step%2 else -.36)
            m.note(melody[(bar*8+step)%len(melody)],st+step*.5*b,.37,'lead',.135,pan=.15)
    m.save('combat.mp3')

if __name__=='__main__':
    exploration();battle()
