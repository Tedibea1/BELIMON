"""BELLYMON - theme original de preparation de combat.
Composition generative reproductible, sans samples ni contenus tiers.
Installation: python generate_preparation.py (necessite numpy et ffmpeg).
Sortie: preparation.mp3 -- meme format que les pistes BELLYMON existantes.
"""
from pathlib import Path
import math
import subprocess
import numpy as np

ROOT = Path(__file__).resolve().parent
OUT = ROOT / 'preparation.mp3'
SR = 24000
RNG = np.random.default_rng(16204)
NAMES = {n:i for i,n in enumerate(['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'])}

def hz(note):
    n,octave=note[:-1],int(note[-1]);midi=(octave+1)*12+NAMES[n]
    return 440*2**((midi-69)/12)

def env(n,attack=.02,release=.18,decay=None):
    t=np.arange(n,dtype=np.float32)/SR
    total=n/SR
    a=np.minimum(1,t/max(.001,attack))
    r=np.minimum(1,np.maximum(0,total-t)/max(.001,release))
    if decay is not None: a*=np.exp(-t/decay)
    return a*r

class Loop:
    def __init__(self,bpm,bars):
        self.beat=60/bpm;self.duration=bars*4*self.beat
        self.count=round(self.duration*SR)
        self.left=np.zeros(self.count,np.float32)
        self.right=np.zeros(self.count,np.float32)
    def add(self,at,signal,pan=0):
        if len(signal)==0:return
        l=math.sqrt((1-pan)/2);r=math.sqrt((1+pan)/2)
        idx=int(round(at*SR))%self.count
        for offset in range(0,len(signal),self.count):
            part=signal[offset:offset+self.count]
            start=(idx+offset)%self.count
            first=min(len(part),self.count-start)
            self.left[start:start+first]+=part[:first]*l
            self.right[start:start+first]+=part[:first]*r
            if first<len(part):
                self.left[:len(part)-first]+=part[first:]*l
                self.right[:len(part)-first]+=part[first:]*r
    def note(self,pitch,at,beats,kind='bell',gain=.15,pan=0):
        f=hz(pitch);secs=beats*self.beat
        extra={'pad':.44,'lead':.32,'bell':.26,'bass':.18,'pluck':.21}[kind]
        t=np.arange(round((secs+extra)*SR),dtype=np.float32)/SR
        phi=2*np.pi*f*t
        if kind=='pad':
            sig=(.57*np.sin(phi)+.21*np.sin(phi*1.005)+.18*np.sin(phi*.994)+.09*np.sin(2*phi))
            sig*=env(len(t),attack=.16,release=.45)
        elif kind=='bell':
            sig=(.69*np.sin(phi)+.22*np.sin(phi*2.002)+.13*np.sin(phi*3.997))
            sig*=env(len(t),attack=.006,release=.24,decay=.50)
        elif kind=='lead':
            vibrato=.0031*np.sin(2*np.pi*5.0*t)
            sig=(np.sin(phi+vibrato*phi)+.18*np.sin(2*phi)+.06*np.sin(3*phi))
            sig*=env(len(t),attack=.035,release=.34)
        elif kind=='pluck':
            sig=(np.sin(phi)+.25*np.sin(2*phi)+.12*np.sin(3*phi))
            sig*=env(len(t),attack=.006,release=.16,decay=.22)
        else:
            sig=(.8*np.sin(phi)+.2*np.sin(phi*2))*env(len(t),attack=.018,release=.20)
        self.add(at,gain*sig,pan)
    def drum(self,kind,at,gain=1):
        dur={'kick':.28,'snare':.20,'hat':.065}[kind]
        t=np.arange(round(dur*SR),dtype=np.float32)/SR
        if kind=='kick':
            f=55+125*np.exp(-t*21)
            snd=.48*np.sin(2*np.pi*np.cumsum(f)/SR)*np.exp(-t*19)
        elif kind=='snare':
            noise=RNG.standard_normal(len(t)).astype('float32')
            snd=.12*noise*np.exp(-t*22)+.10*np.sin(2*np.pi*170*t)*np.exp(-t*24)
        else:
            noise=RNG.standard_normal(len(t)).astype('float32')
            filtered=noise-np.convolve(noise,np.ones(15)/15,mode='same')
            snd=.10*filtered*np.exp(-t*62)
        self.add(at,snd*gain,pan=.10 if kind=='hat' else 0)
    def render(self,dest):
        l=self.left.copy();r=self.right.copy()
        for delay,amount in [(.17,.10),(.31,.075),(.47,.045)]:
            d=round(delay*SR)
            l+=np.roll(self.right,d)*amount
            r+=np.roll(self.left,d+59)*amount
        peak=max(float(abs(l).max()),float(abs(r).max()),.0001)
        l=.67*np.tanh(l*1.4/max(peak,.80))
        r=.67*np.tanh(r*1.4/max(peak,.80))
        stereo=np.column_stack((l,r)).astype('<f4')
        subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y',
          '-f','f32le','-ar',str(SR),'-ac','2','-i','pipe:0',
          '-codec:a','libmp3lame','-b:a','112k',str(dest)],
          input=stereo.tobytes(),check=True)
        print(f'{dest}: {self.duration:.2f}s; {dest.stat().st_size//1024} Ko')


def preparation():
    # Passage harmonique entre la promenade de BELLYMON (Ré mineur)
    # et le thème de duel (La mineur). 16 mesures en 4/4.
    m=Loop(104,16);b=m.beat
    chords=[
       ['A3','C4','E4'],['F3','A3','C4'],['D3','F3','A3'],['E3','A3','B3'],
       ['A3','C4','E4'],['G3','B3','D4'],['F3','A3','C4'],['E3','G#3','B3'],
       ['D3','F3','A3'],['F3','A3','C4'],['G3','B3','D4'],['E3','G#3','B3'],
       ['A3','C4','E4'],['F3','A3','C4'],['D3','F3','A3'],['E3','A3','B3']
    ]
    roots=['A2','F2','D2','E2','A2','G2','F2','E2',
           'D2','F2','G2','E2','A2','F2','D2','E2']
    arpeggios=[['A4','C5','E5','C5'],['A4','C5','F5','C5'],
               ['A4','D5','F5','D5'],['B4','E5','G#5','E5'],
               ['A4','C5','E5','C5'],['B4','D5','G5','D5'],
               ['A4','C5','F5','C5'],['G#4','B4','E5','B4'],
               ['A4','D5','F5','D5'],['A4','C5','F5','C5'],
               ['B4','D5','G5','D5'],['G#4','B4','E5','B4'],
               ['A4','C5','E5','C5'],['A4','C5','F5','C5'],
               ['A4','D5','F5','D5'],['G#4','B4','E5','B4']]
    lead=[
       [('E5',0,1.5),('C5',2,1.35)], [('C5',0,1),('D5',1.5,1),('E5',3,0.8)],
       [('F5',0,1.5),('E5',2,1)], [('B4',0,1.2),('E5',2,1.4)],
       [('E5',0,1),('A5',2,1)], [('G5',0,1.5),('D5',2,1)],
       [('C5',0,1.3),('F5',2,1.2)], [('E5',0,1.2),('G#5',2,1.25)],
       [('A5',0,1.25),('F5',2,1)], [('A5',0,1.5),('C6',2.5,.8)],
       [('B5',0,1.2),('G5',2,1)], [('E5',0,1.4),('B4',2,1.4)],
       [('C5',0,1.2),('E5',2,1.4)], [('F5',0,1.4),('E5',2,1)],
       [('D5',0,1),('A4',2,1.4)], [('B4',0,1.5),('G#4',2,1.1)]
    ]
    for bar,(chord,root,arp) in enumerate(zip(chords,roots,arpeggios)):
        st=bar*4*b
        # Pads longs et larges, à la manière de l'exploration.
        for i,n in enumerate(chord):
            m.note(n,st,3.9,'pad',.071,pan=(-.28,0,.28)[i])
        m.note(chord[1],st+2*b,1.7,'pad',.026,pan=.40)
        # Pulsation de preparation, volontairement bien plus calme que le duel.
        m.note(root,st,1.9,'bass',.155)
        m.note(root,st+2*b,1.7,'bass',.104)
        # Huit notes cristal percussives par mesure, avec alternance stereo.
        for i in range(8):
            pitch=arp[i%4]
            m.note(pitch,st+i*.5*b,.30,'pluck',.073 if i%2==0 else .061,
                   pan=-.32 if i%2 else .32)
        for n,offset,beats in lead[bar]:
            m.note(n,st+offset*b,beats,'lead',.097 if bar<8 else .113,pan=.16)
        # Cloche qui marque l'approche du combat, leger arriere-plan.
        if bar in (0,4,8,12):
            m.note('A5',st,1,'bell',.049,pan=-.40)
        # Percussion ponctuelle : jamais le rythme martial du combat.
        if bar%2==0:m.drum('kick',st,.45)
        if bar>=4:m.drum('hat',st+2*b,.30)
        if bar>=8 and bar%2==1:m.drum('snare',st+3*b,.26)
    m.render(OUT)

if __name__=='__main__':preparation()
