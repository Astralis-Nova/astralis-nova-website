// Astralis Nova A/N cutout support sphere, rendered from the existing SDF model.
// 240 frames, seamless yaw + pitch + roll, moving white reflection panels, blue cavity light.
// Outputs straight-alpha RGBA raw frames. Build with g++ -O3 -fopenmp.
// Example: render-support-sphere 0 240 360 2 | ffmpeg -f rawvideo -pixel_format rgba \
//   -video_size 360x360 -framerate 20 -i - -c:v libwebp_anim -quality 82 \
//   -compression_level 5 -loop 0 support-sphere-tumble.webp
#include <cmath>
#include <algorithm>
#include <cstdio>
#include <cstdlib>
#include <vector>
using std::min; using std::max;
struct V {float x,y,z; V operator+(V a)const{return{x+a.x,y+a.y,z+a.z};} V operator-(V a)const{return{x-a.x,y-a.y,z-a.z};} V operator*(float a)const{return{x*a,y*a,z*a};}};
float dot(V a,V b){return a.x*b.x+a.y*b.y+a.z*b.z;}
float len(V a){return sqrtf(dot(a,a));}
V norm(V a){return a*(1.f/max(1e-9f,len(a)));}
float clamp(float x,float a=0,float b=1){return max(a,min(b,x));}
float seg(float x,float y,float ax,float ay,float bx,float by,float width){float dx=bx-ax,dy=by-ay;float t=clamp(((x-ax)*dx+(y-ay)*dy)/(dx*dx+dy*dy));return hypotf(x-ax-t*dx,y-ay-t*dy)-width;}
float box(float x,float y,float cx,float cy,float wx,float wy){float a=fabsf(x-cx)-wx,b=fabsf(y-cy)-wy;return hypotf(max(a,0.f),max(b,0.f))+min(max(a,b),0.f);}
float smoothMax(float a,float b,float k){float h=clamp(.5f+.5f*(a-b)/k);return b*(1-h)+a*h+k*h*(1-h);}
float sdf(V p){
 float r=len(p);float shell=max(r-1.f,.855f-r);
 float A=min(seg(p.x,p.y,-.43f,-.51f,0,.53f,.094f),seg(p.x,p.y,0,.53f,.43f,-.51f,.094f));
 A=min(A,box(p.x,p.y,0,-.165f,.30f,.085f));
 // A small structural bridge keeps the A counter attached to the shell.
 A=max(A,-box(p.x,p.y,.202f,.09f,.13f,.023f));
 A=max(A,.26f-p.z);
 float x=-p.x;
 float N=min(box(x,p.y,-.355f,0,.096f,.58f),box(x,p.y,.355f,0,.096f,.58f));
 N=min(N,seg(x,p.y,-.355f,.49f,.355f,-.49f,.099f));
 N=max(N,p.z+.26f);
 float u=fabsf(p.z),v=fabsf(p.y);
 float star=min((u/.37f+v/.115f-1.f)*.11f,(u/.115f+v/.37f-1.f)*.11f);
 star=max(star,.50f-fabsf(p.x));
 float pin=hypotf(fabsf(p.x)-.62f,fabsf(p.y)-.43f)-.048f;
 pin=max(pin,.35f-fabsf(p.z));
 return smoothMax(shell,-min(min(A,N),min(star,pin)),.022f);
}
V rotate(V p,float c,float s){return {c*p.x-s*p.z,p.y,s*p.x+c*p.z};}
V unrotate(V p,float c,float s){return {c*p.x+s*p.z,p.y,-s*p.x+c*p.z};}
V normal(V p){float e=.0007f;return norm({sdf(p+V{e,0,0})-sdf(p-V{e,0,0}),sdf(p+V{0,e,0})-sdf(p-V{0,e,0}),sdf(p+V{0,0,e})-sdf(p-V{0,0,e})});}
float softPanel(V r,V axis,float sharp){return powf(max(0.f,dot(r,axis)),sharp);}
V environment(V r){
 float base=.025f+.09f*(r.y+1.f);
 float a=softPanel(r,norm({-.7f,.6f,.4f}),12);
 float b=softPanel(r,norm({.8f,.3f,.1f}),34);
 float t=softPanel(r,norm({0,1.f,-.3f}),18);
 float strip=expf(-powf((r.x+.38f)/.16f,4.f))*powf(max(0.f,r.z),1.2f)*(.35f+.65f*clamp(r.y+.5f));
 float lower=softPanel(r,norm({.2f,-.7f,.5f}),38);
 return {base+2.8f*a+2.7f*b+2.1f*t+1.3f*strip+.45f*lower,base*1.04f+2.85f*a+2.6f*b+2.15f*t+1.34f*strip+.5f*lower,base*1.12f+3.0f*a+2.5f*b+2.25f*t+1.43f*strip+.6f*lower};
}
float hash(int a,int b){unsigned int h=(unsigned int)(a*374761393u+b*668265263u);h=(h^(h>>13u))*1274126177u;return (h&0xFFFFFF)/float(0xFFFFFF);}
V space(float x,float y){
 float blue=.006f+.014f*expf(-powf((y-.35f*x-.2f)/.34f,2.f));
 V color={blue*.30f,blue*.47f,blue};
 float scale=30.f, gx=(x+3.f)*scale,gy=(y+3.f)*scale;int ix=int(gx),iy=int(gy);
 float chance=hash(ix,iy);
 if(chance>.958f){float dx=gx-ix-(.15f+.7f*hash(ix+87,iy+11)),dy=gy-iy-(.15f+.7f*hash(ix+4,iy+73));float r2=dx*dx+dy*dy;float bright=.5f+.5f*hash(ix+19,iy);float star=expf(-r2/.0014f)*bright+expf(-r2/.014f)*.06f*bright;color=color+V{star*.89f,star*.95f,star};}
 return color;
}
struct Rotation {float cy,sy,cx,sx,cz,sz,cl,sl;};
V rx(V p,float c,float s){return {p.x,c*p.y-s*p.z,s*p.y+c*p.z};}
V rz(V p,float c,float s){return {c*p.x-s*p.y,s*p.x+c*p.y,p.z};}
V intoObject(V p,Rotation r){return rotate(rx(rz(p,r.cz,r.sz),r.cx,r.sx),r.cy,r.sy);}
V intoWorld(V p,Rotation r){return rz(rx(unrotate(p,r.cy,r.sy),r.cx,-r.sx),r.cz,-r.sz);}
V render(float fx,float fy,Rotation rotation,bool &hit){
 hit=false;
 V ro={0,.10f,3.7f};V rd=norm({fx,fy-.025f,-3.f});
 float b=dot(ro,rd),disc=b*b-dot(ro,ro)+1.025f*1.025f;
 if(disc<0)return space(fx,fy);
 float t=max(0.f,-b-sqrtf(disc)),end=-b+sqrtf(disc);
 V localRo=intoObject(ro,rotation),localRd=intoObject(rd,rotation),p;
 for(int step=0;step<128 && t<end;step++){
  p=localRo+localRd*t;float d=sdf(p);
  if(d<.00055f){hit=true;break;} t+=max(.0004f,d*.82f);
 }
 if(!hit)return space(fx,fy);
 V n=normal(p),wn=intoWorld(n,rotation);V reflected=rd-wn*(2*dot(rd,wn));
 V col=environment(rotate(reflected,rotation.cl,rotation.sl));
 float ao=1.f;
 for(int i=1;i<=4;i++){float dist=.04f*i;ao-=max(0.f,dist-sdf(p+n*dist))*(1.3f/i);}
 ao=clamp(ao,.16f,1.f);
 float inner=dot(p,n)<0 ? .50f:1.f;
 float diffuse=.11f+.29f*max(0.f,dot(wn,norm({-.5f,.7f,1.f})));
 float edge=powf(1.f-clamp(dot(wn,rd*-1)),4.f)*.12f;
 float brush=1.f+.012f*sinf(p.y*1900.f+2*sinf(p.x*23.f));
 col=col*(ao*inner*brush*.72f)+V{diffuse*.86f,diffuse*1.01f,diffuse*1.16f}*(ao*inner)+V{edge*.2f,edge*1.6f,edge*4.0f};
 float cavity=max(0.f,dot(n,norm(p)*-1.f));
 float blueLight=cavity*.75f;
 col=col+V{.012f,.26f,1.22f}*blueLight;
 float blueRim=powf(max(0.f,dot(wn,norm({.65f,.35f,-.7f}))),3.f)*.6f;
 col=col+V{.018f,.28f,1.4f}*blueRim;
 return {powf(1-expf(-col.x*1.12f),.4545f),powf(1-expf(-col.y*1.12f),.4545f),powf(1-expf(-col.z*1.12f),.4545f)};
}
int main(int argc,char**argv){int start=argc>1?atoi(argv[1]):0;int count=argc>2?atoi(argv[2]):1;int size=argc>3?atoi(argv[3]):640;int samples=argc>4?atoi(argv[4]):1;std::vector<unsigned char> frame(size*size*4);
 for(int f=start;f<start+count;f++){
  float angle=6.28318530718f*f/240.f;
  float yaw=angle+.18f*sinf(2*angle),pitch=.48f*sinf(angle),roll=.28f*sinf(2*angle),lamp=.38f*sinf(angle+.7f);
  Rotation rotation={cosf(yaw),sinf(yaw),cosf(pitch),sinf(pitch),cosf(roll),sinf(roll),cosf(lamp),sinf(lamp)};
  #pragma omp parallel for schedule(dynamic,8)
  for(int y=0;y<size;y++)for(int x=0;x<size;x++){
   V col={0,0,0}; float coverage=0;
   for(int j=0;j<samples;j++){float off=samples==1?.5f:(j==0?.25f:.75f);float fx=((x+off)/size-.5f)*2.14f,fy=(.5f-(y+off)/size)*2.14f;bool hit=false; V sample=render(fx,fy,rotation,hit); if(hit){col=col+sample;coverage+=1;}}
   col=col*(1.f/max(coverage,1.f));int k=(y*size+x)*4;frame[k]=(unsigned char)(255*clamp(col.x));frame[k+1]=(unsigned char)(255*clamp(col.y));frame[k+2]=(unsigned char)(255*clamp(col.z));frame[k+3]=(unsigned char)(255*coverage/samples);
  }
  fwrite(frame.data(),1,frame.size(),stdout);
  if(f%30==0)fprintf(stderr,"Rendered %d / %d\n",f-start,count);
 }
}
