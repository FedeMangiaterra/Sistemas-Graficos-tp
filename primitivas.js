function crearMatrizNivel(vectores) {

    matrizNivel = mat4.fromValues(
    
    vectores[2][0], vectores[2][1], vectores[2][2],0,

    vectores[3][0], vectores[3][1], vectores[3][2],0,

    vectores[1][0], vectores[1][1], vectores[1][2],0,

    vectores[0][0], vectores[0][1], vectores[0][2], 1);


    return matrizNivel;
}

function superficieBarrido(vertice, nivel, forma, recorrido) {
    var parteEntera = Math.trunc(vertice);
    var parteDecimal = vertice - parteEntera;
    if (parteEntera + 1 < forma.length){
        var p1 = vec3.create();
        var p2 = vec3.create();
        var puntoForma = vec3.create()
        vec3.scale(p1,forma[parteEntera], 1 - parteDecimal); 
        vec3.scale(p2,forma[parteEntera+1], parteDecimal);
        vec3.add(puntoForma, p1, p2);
    } else {
        puntoForma = forma[parteEntera];
    }
    var cant_curvas = recorrido.length / 4;
    var u = nivel * cant_curvas;
    if (u >= 1*cant_curvas) {
        u = 1*cant_curvas;
    }

    var matrizNivel = crearMatrizNivel(evaluarBezierCubica(u, recorrido));
    var punto_4 = [puntoForma[0],puntoForma[1],puntoForma[2], 1];
    var nuevoPunto = vec4.create(); 
    vec4.transformMat4(nuevoPunto, punto_4, matrizNivel);
    return [nuevoPunto[0], nuevoPunto[1], nuevoPunto[2]];
}

function Anillo(radio) {

    this.getPosicion=function(u,v,filasTotales,columnasTotales){
        var u_curva = u * 2;
        var puntosdeControlForma = [[-0.25,0,0],[-0.25,0.3,0],[0.25,0.3,0],[0.25,0,0],[0.25,0,0],[0.25,-0.3,0],[-0.25,-0.3,0],[-0.25,0,0]];
        var puntoCurva = evaluarBezierCubica(u_curva,puntosdeControlForma);
        var forma = [puntoCurva[0]];
        var recorrido = [[-radio,0,0],[-radio,1.33*radio,0],[radio,1.33*radio,0],[radio,0,0],[radio,0,0],[radio,-1.33*radio,0],[-radio,-1.33*radio,0],[-radio,0,0]];

        return superficieBarrido(0,v,forma,recorrido);

    }

    this.getNormal=function(alfa,beta,filasTotales,columnasTotales){
        /*var recorrido = [[0,0,0],[0,1.3,0],[2,1.3,0],[2,0,0],[2,0,0],[2,-1.3,0],[0,-1.3,0],[0,0,0]];
        var cant_curvas = recorrido.length / 4;
        var u = beta * cant_curvas;
        if (u >= 1*cant_curvas) {
            u = 1*cant_curvas - 0.001;
        }

        var n = evaluarBezierCubica(u, recorrido);
        var normal = vec3.fromValues(n[3][0],n[3][1],n[3][2]);
        vec3.normalize(normal,normal);
        //vec3.scale(normal,normal,-1);
        var n = vec3.create();
        vec3.rotateY(n,normal,normal,Math.PI/4);*/

        /*verticeForma = alfa * columnasTotales;

        if (verticeForma == 0 || verticeForma == 3 || verticeForma == 4) {
            var normal = vec3.fromValues(0,0,1);
            vec3.normalize(normal,normal);
        } else {
            var normal = vec3.fromValues(0,0,-1);
            vec3.normalize(normal,normal);
        }*/

        var p=this.getPosicion(alfa,beta,filasTotales,columnasTotales);
        var v=vec3.create();
        vec3.normalize(v,p);

        var delta=0.01;
        var p1=this.getPosicion(alfa,beta,filasTotales,columnasTotales);
        var p2=this.getPosicion(alfa,beta+delta,filasTotales,columnasTotales);
        var p3=this.getPosicion(alfa+delta,beta,filasTotales,columnasTotales);

        var v1=vec3.fromValues(p2[0]-p1[0],p2[1]-p1[1],p2[2]-p1[2]);
        var v2=vec3.fromValues(p3[0]-p1[0],p3[1]-p1[1],p3[2]-p1[2]);

        vec3.normalize(v1,v1);
        vec3.normalize(v2,v2);
        
        var n=vec3.create();
        vec3.cross(n,v1,v2);
        vec3.scale(n,n,-1);
        return n;
        
        //return normal;
    }

    this.getCoordenadasTextura=function(u,v){
        return [u,v];
    }
}

function Modulo(radio,anguloBarrido) {

    this.getPosicion=function(u,v,filasTotales,columnasTotales){
        var forma = [[0.75,0.25,0],[0.75,-0.25,0],[-0.75,-0.25,0],[-0.75,0.25,0],[0.75,0.25,0]];
        var recorrido = [[-radio,0,0],[-radio,1.33*radio,0],[radio,1.33*radio,0],[radio,0,0],[radio,0,0],[radio,-1.33*radio,0],[-radio,-1.33*radio,0],[-radio,0,0]];
        verticeForma = u * columnasTotales;
        v = v * anguloBarrido / (2*Math.PI);

        return superficieBarrido(verticeForma,v,forma,recorrido);

    }

    this.getNormal=function(alfa,beta,filasTotales,columnasTotales){
        var recorrido = [[0,0,0],[0,1.3,0],[2,1.3,0],[2,0,0],[2,0,0],[2,-1.3,0],[0,-1.3,0],[0,0,0]];
        var cant_curvas = recorrido.length / 4;
        var u = beta * cant_curvas;
        if (u >= 1*cant_curvas) {
            u = 1*cant_curvas - 0.001;
        }

        var n = evaluarBezierCubica(u, recorrido);
        var normal = vec3.fromValues(n[3][0],n[3][1],n[3][2]);
        vec3.normalize(normal,normal);
        //vec3.scale(normal,normal,-1);
        var n = vec3.create();
        vec3.rotateY(n,normal,normal,Math.PI/4);

        /*verticeForma = alfa * columnasTotales;

        if (verticeForma == 0 || verticeForma == 3 || verticeForma == 4) {
            var normal = vec3.fromValues(0,0,1);
            vec3.normalize(normal,normal);
        } else {
            var normal = vec3.fromValues(0,0,-1);
            vec3.normalize(normal,normal);
        }*/

        /*var p=this.getPosicion(alfa,beta,filasTotales,columnasTotales);
        var v=vec3.create();
        vec3.normalize(v,p);

        var delta=0.05;
        var p1=this.getPosicion(alfa,beta,filasTotales,columnasTotales);
        var p2=this.getPosicion(alfa,beta+delta,filasTotales,columnasTotales);
        var p3=this.getPosicion(alfa+delta,beta,filasTotales,columnasTotales);

        var v1=vec3.fromValues(p2[0]-p1[0],p2[1]-p1[1],p2[2]-p1[2]);
        var v2=vec3.fromValues(p3[0]-p1[0],p3[1]-p1[1],p3[2]-p1[2]);

        vec3.normalize(v1,v1);
        vec3.normalize(v2,v2);
        
        var n=vec3.create();
        vec3.cross(n,v1,v2);
        vec3.scale(n,n,-1);
        return n;*/
        
        return normal;
    }

    this.getCoordenadasTextura=function(u,v){
        return [u,v];
    }
}

function Plano(ancho,largo){

    this.getPosicion=function(u,v,filasTotales,columnasTotales){

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

    this.getPosicion=function(u,v,filasTotales,columnasTotales){
        var theta = u*Math.PI*2;
        var phi = v*Math.PI;
        var x=(Math.cos(theta))*(Math.sin(phi))*radio;
        var y=(Math.sin(theta))*(Math.sin(phi))*radio;
        var z=Math.cos(phi)*radio;

        return [x,y,z];
    }

    this.getNormal=function(alfa,beta,filasTotales,columnasTotales){
        var p=this.getPosicion(alfa,beta,filasTotales,columnasTotales);
        var v=vec3.create();
        vec3.normalize(v,p);

        var delta=0.05;
        var p1=this.getPosicion(alfa,beta,filasTotales,columnasTotales);
        var p2=this.getPosicion(alfa,beta+delta,filasTotales,columnasTotales);
        var p3=this.getPosicion(alfa+delta,beta,filasTotales,columnasTotales);

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

function Tubo(radio, altura, cerrado = false) {
    this.getPosicion=function(u,v,filasTotales,columnasTotales){
        var theta = u*Math.PI*2;
        var x = Math.cos(theta) * radio;
        var y = v*altura - altura/2;
        var z = Math.sin(theta) * radio;
        if (cerrado == true && ((v == 0) || (v == 1))) {
            x = 0;
            z = 0;
            if (v == 0) {
                y += (1 / filasTotales * altura);  
            } else {
                y -= (1 / filasTotales * altura);
            }
        }
        
        return [x,y,z];
    }

    this.getNormal=function(alfa,beta,filasTotales,columnasTotales){
        var p=this.getPosicion(alfa,beta,filasTotales,columnasTotales);
        var v=vec3.create();
        vec3.normalize(v,p);

        var delta=0.05;
        var p1=this.getPosicion(alfa,beta,filasTotales,columnasTotales);
        var p2=this.getPosicion(alfa,beta+delta,filasTotales,columnasTotales);
        var p3=this.getPosicion(alfa+delta,beta,filasTotales,columnasTotales);

        var v1=vec3.fromValues(p2[0]-p1[0],p2[1]-p1[1],p2[2]-p1[2]);
        var v2=vec3.fromValues(p3[0]-p1[0],p3[1]-p1[1],p3[2]-p1[2]);

        vec3.normalize(v1,v1);
        vec3.normalize(v2,v2);
        
        var n=vec3.create();
        vec3.cross(n,v1,v2);
        vec3.scale(n,n,-1);

        if (cerrado == true && ((beta == 0) || (beta == 1))) {
            n = [0,-1,0];
            if (beta == 0) n = [0,1,0];
        }

        return n;
    }

    this.getCoordenadasTextura=function(u,v){
        return [u,v];
    }
}

