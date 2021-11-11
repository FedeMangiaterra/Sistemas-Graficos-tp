function Plano(ancho,largo){

    this.getPosicion=function(u,v){

        var x=(u-0.5)*ancho;
        var z=(v-0.5)*largo;
        return [x,0,z];
    }

    this.getNormal=function(u,v){
        return [0,1,0];
    }

    this.getCoordenadasTextura=function(u,v){
        return [u,v];
    }
}

function Esfera(radio){

    this.getPosicion=function(u,v){
        var theta = u*Math.PI*2;
        var phi = v*Math.PI;
        var x=(Math.cos(theta))*(Math.sin(phi))*radio;
        var y=(Math.sin(theta))*(Math.sin(phi))*radio;
        var z=Math.cos(phi)*radio;

        return [x,y,z];
    }

    this.getNormal=function(alfa,beta){
        var p=this.getPosicion(alfa,beta);
        var v=vec3.create();
        vec3.normalize(v,p);

        var delta=0.05;
        var p1=this.getPosicion(alfa,beta);
        var p2=this.getPosicion(alfa,beta+delta);
        var p3=this.getPosicion(alfa+delta,beta);

        var v1=vec3.fromValues(p2[0]-p1[0],p2[1]-p1[1],p2[2]-p1[2]);
        var v2=vec3.fromValues(p3[0]-p1[0],p3[1]-p1[1],p3[2]-p1[2]);

        vec3.normalize(v1,v1);
        vec3.normalize(v2,v2);
        
        var n=vec3.create();
        vec3.cross(n,v1,v2);
        vec3.scale(n,n,-1);
        return n;
    }

    this.getCoordenadasTextura=function(u,v){
        return [u,v];
    }
}

function Tubo(radio, altura) {
    this.getPosicion=function(u,v){
        var theta = u*Math.PI*2;
        var x = Math.cos(theta) * radio;
        var y = v*altura - altura/2;
        var z = Math.sin(theta) * radio;
        
        return [x,y,z];
    }

    this.getNormal=function(alfa,beta){
        var p=this.getPosicion(alfa,beta);
        var v=vec3.create();
        vec3.normalize(v,p);

        var delta=0.05;
        var p1=this.getPosicion(alfa,beta);
        var p2=this.getPosicion(alfa,beta+delta);
        var p3=this.getPosicion(alfa+delta,beta);

        var v1=vec3.fromValues(p2[0]-p1[0],p2[1]-p1[1],p2[2]-p1[2]);
        var v2=vec3.fromValues(p3[0]-p1[0],p3[1]-p1[1],p3[2]-p1[2]);

        vec3.normalize(v1,v1);
        vec3.normalize(v2,v2);
        
        var n=vec3.create();
        vec3.cross(n,v1,v2);
        vec3.scale(n,n,-1);
        return n;
    }

    this.getCoordenadasTextura=function(u,v){
        return [u,v];
    }
}

