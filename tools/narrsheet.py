# 把 tools/narrshot.js 截的小图拼成一张 4 列的总览（左上角是编号）。用法：python3 tools/narrsheet.py <目录> <从第几张> <到第几张> <输出.jpg>
import sys,os
from PIL import Image,ImageDraw
d=sys.argv[1]; a=int(sys.argv[2]); b=int(sys.argv[3]); out=sys.argv[4]
W,H=480,270; cols=4
ids=[i for i in range(a,b+1) if os.path.exists('%s/%03d.jpg'%(d,i))]
rows=(len(ids)+cols-1)//cols
s=Image.new('RGB',(W*cols,H*rows),(20,20,20)); dr=ImageDraw.Draw(s)
for k,i in enumerate(ids):
    im=Image.open('%s/%03d.jpg'%(d,i)).convert('RGB').resize((W,H)); x,y=(k%cols)*W,(k//cols)*H; s.paste(im,(x,y)); dr.rectangle((x,y,x+44,y+22),fill=(0,0,0)); dr.text((x+6,y+5),str(i),fill=(255,230,120))
s.save(out,quality=78)
