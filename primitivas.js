

function crearMatrizNivel(vectores) {

    matrizNivel = mat4.fromValues(
    
    vectores[2][0], vectores[2][1], vectores[2][2],0,

    vectores[3][0], vectores[3][1], vectores[3][2],0,

    vectores[1][0], vectores[1][1], vectores[1][2],0,

    vectores[0][0], vectores[0][1], vectores[0][2], 1);


    return matrizNivel;
}

function superficieBarrido(vertice, nivel, forma, recorrido, matrizTransformacion) {
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
    if (matrizTransformacion){
        mat4.multiply(matrizNivel, matrizNivel, matrizTransformacion);
    }
    var punto_4 = [puntoForma[0],puntoForma[1],puntoForma[2], 1];
    var nuevoPunto = vec4.create(); 
    vec4.transformMat4(nuevoPunto, punto_4, matrizNivel);
    //console.log(nuevoPunto[0]);
    return [nuevoPunto[0], nuevoPunto[1], nuevoPunto[2]];
}

function Anillo(radio) {

    this.getPosicion=function(u,v,filasTotales,columnasTotales){
        var u_curva = u * 2;
        var puntosdeControlForma = [[-0.25,0,0],[-0.25,0.3,0],[0.25,0.3,0],[0.25,0,0],[0.25,0,0],[0.25,-0.3,0],[-0.25,-0.3,0],[-0.25,0,0]];
        var puntoCurva = evaluarBezierCubica(u_curva,puntosdeControlForma);
        var forma = [puntoCurva[0]];
        var recorrido = [[-radio,0,0],[-radio,1.33*radio,0],[radio,1.33*radio,0],[radio,0,0],[radio,0,0],[radio,-1.33*radio,0],[-radio,-1.33*radio,0],[-radio,0,0]];

        return superficieBarrido(0,v,forma,recorrido,null);

    }

    this.normal=function(alfa,beta,filasTotales,columnasTotales){

        var p=this.getPosicion(alfa,beta,filasTotales,columnasTotales);
        var v=vec3.create();
        vec3.normalize(v,p);
    
        var delta=0.001;
        var p1=this.getPosicion(alfa,beta,filasTotales,columnasTotales);
        var p2=this.getPosicion(alfa,beta+delta,filasTotales,columnasTotales);
        var p3=this.getPosicion(alfa+delta,beta,filasTotales,columnasTotales);
    
        var v1=vec3.fromValues(p2[0]-p1[0],p2[1]-p1[1],p2[2]-p1[2]);
        var v2=vec3.fromValues(p3[0]-p1[0],p3[1]-p1[1],p3[2]-p1[2]);
    
        vec3.normalize(v1,v1);
        vec3.normalize(v2,v2);
        
        var n=vec3.create();
        vec3.cross(n,v1,v2);
    
        return n;
    }
    
    this.normalInterpolada=function(alfa,beta,filasTotales,columnasTotales) {
        var delta = 0.002;
        var normal_1 = this.normal(alfa + delta, beta, filasTotales, columnasTotales);
        var normal_2 = this.normal(alfa - delta, beta, filasTotales, columnasTotales);
        var normal_3 = this.normal(alfa, beta + delta, filasTotales, columnasTotales);
        var normal_4 = this.normal(alfa, beta - delta, filasTotales, columnasTotales);
    
        var normal = vec3.create();
        normal[0] = (normal_1[0] + normal_2[0] + normal_3[0] + normal_4[0]) / 4;
        normal[1] = (normal_1[1] + normal_2[1] + normal_3[1] + normal_4[1]) / 4;
        normal[2] = (normal_1[2] + normal_2[2] + normal_3[2] + normal_4[2]) / 4;
    
        return normal;
    }

    this.getNormal=function(alfa,beta,filasTotales,columnasTotales){
        //return this.normalInterpolada(alfa,beta,filasTotales,columnasTotales);
        var p=this.getPosicion(alfa,beta,filasTotales,columnasTotales);
        var v=vec3.create();
        vec3.normalize(v,p);

        var delta = 0.001;
        var p1=this.getPosicion(alfa,beta,filasTotales,columnasTotales);
        var p2=this.getPosicion(alfa,beta+delta,filasTotales,columnasTotales);
        var p3=this.getPosicion(alfa+delta,beta,filasTotales,columnasTotales);

        var v1=vec3.fromValues(p2[0]-p1[0],p2[1]-p1[1],p2[2]-p1[2]);
        var v2=vec3.fromValues(p3[0]-p1[0],p3[1]-p1[1],p3[2]-p1[2]);

        vec3.normalize(v1,v1);
        vec3.normalize(v2,v2);
        
        var n=vec3.create();
        vec3.cross(n,v1,v2);
        /*if (!(alfa > 0.25 && alfa < 0.75)) {
            vec3.scale(n,n,-1);
        }*/
        return n;
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
        var fraccionRecorrida = anguloBarrido / (2*Math.PI)
        v = v * fraccionRecorrida;
        
        if (v == 0 ) {
            return evaluarBezierCubica((v + 1 * fraccionRecorrida / filasTotales)*2, recorrido)[0];
        } else if ( v == anguloBarrido / (2*Math.PI)) {
            return evaluarBezierCubica((v - 1 * fraccionRecorrida / filasTotales)*2, recorrido)[0];
        } else {
            return superficieBarrido(verticeForma,v,forma,recorrido, null);
        }
    }

    this.getNormal=function(alfa,beta,filasTotales,columnasTotales){
        
        /*verticeForma = alfa * columnasTotales;
        var recorrido = [[-radio,0,0],[-radio,1.33*radio,0],[radio,1.33*radio,0],[radio,0,0],[radio,0,0],[radio,-1.33*radio,0],[-radio,-1.33*radio,0],[-radio,0,0]];
        var fraccionRecorrida = anguloBarrido / (2*Math.PI)
        nivel = beta * fraccionRecorrida;

        var cant_curvas = recorrido.length / 4;
        var u = nivel * cant_curvas;
        if (u >= 1*cant_curvas) {
            u = 1*cant_curvas;
        }
        n = evaluarBezierCubica(u, recorrido)[3];
        var normal = vec3.create();
        normal[0] = n[0] / 2;
        normal[1] = n[1] / 2;
        normal[2] = (n[2] + 1) / 2;
        vec3.normalize(normal,normal);
        vec3.scale(normal,normal,-1);
        return normal;*/

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
       /* if (alfa >= 0.5 && alfa < 0.75) {
            vec3.scale(n,n,-1);
        }*/
        return n;
    }

    this.getCoordenadasTextura=function(u,v){
        var fraccionRecorrida = anguloBarrido / (Math.PI/2);
        v = v * fraccionRecorrida + 0.375*(1-fraccionRecorrida);
        return [u,v];
    }
}

function BloqueNucleo() {
    this.getPosicion=function(u,v,filasTotales,columnasTotales){
        var u_curva = u * 8;
        var puntosDeControlForma = [[-1,2,0],[-1,2,0],[1,2,0],[1,2,0],[1,2,0],[1,2,0],
                    [2,2,0],[2,1,0],[2,1,0],[2,1,0],[2,-1,0],[2,-1,0],[2,-1,0],
                    [2,-1,0],[2,-2,0],[1,-2,0],[1,-2,0],[1,-2,0],[-1,-2,0],
                    [-1,-2,0],[-1,-2,0],[-1,-2,0],[-2,-2,0],[-2,-1,0],[-2,-1,0],
                    [-2,-1,0],[-2,1,0],[-2,1,0],[-2,1,0],[-2,1,0],[-2,2,0],[-1,2,0]];
        var puntoCurva = evaluarBezierCubica(u_curva,puntosDeControlForma);
        var forma = [puntoCurva[0]];
        var recorrido = [[0,0,0],[1,0,0],[2,0,0],[3,0,0]];
        if (v != 0 && v != 1){
            return superficieBarrido(0,v,forma,recorrido, null);
        } else if (v == 0) {
            return [0 + (3 / filasTotales),0,0];
        } else if (v == 1) {
            return [3 - (3 / filasTotales),0,0];
        }
    }
    this.getNormal=function(alfa,beta,filasTotales,columnasTotales){

        var p=this.getPosicion(alfa,beta,filasTotales,columnasTotales);
        var v=vec3.create();
        vec3.normalize(v,p);

        var delta = 0.001;
        var p1=this.getPosicion(alfa,beta,filasTotales,columnasTotales);
        var p2=this.getPosicion(alfa,beta+delta,filasTotales,columnasTotales);
        var p3=this.getPosicion(alfa+delta,beta,filasTotales,columnasTotales);

        var v1=vec3.fromValues(p2[0]-p1[0],p2[1]-p1[1],p2[2]-p1[2]);
        var v2=vec3.fromValues(p3[0]-p1[0],p3[1]-p1[1],p3[2]-p1[2]);

        vec3.normalize(v1,v1);
        vec3.normalize(v2,v2);
        
        var n=vec3.create();
        vec3.cross(n,v1,v2);
        //vec3.scale(n,n,-1);
        return n;
    }

    this.getCoordenadasTextura=function(u,v){
        return [u,v];
    }
}

function ModuloNucleo_1() {
    
    this.getPosicion=function(u,v,filasTotales,columnasTotales){
        var u_curva = u * 2;
        var puntosdeControlForma = [[-0.25,0,0],[-0.25,0.3,0],[0.25,0.3,0],[0.25,0,0],[0.25,0,0],[0.25,-0.3,0],[-0.25,-0.3,0],[-0.25,0,0]];
        var puntoCurva = evaluarBezierCubica(u_curva,puntosdeControlForma);
        var forma = [puntoCurva[0]];
        var recorrido = [[-0.5,0,0],[-0.17,0,0],[0.16,0,0],[0.5,0,0]];
        var matrizTransformacion = mat4.create();
        if (v <= 0.15) {
            mat4.scale(matrizTransformacion, matrizTransformacion, [0.7+2*v,0.7+2*v,0.7+2*v]);
        } else if (v >= 0.85) {
            mat4.scale(matrizTransformacion, matrizTransformacion, [2.7-2*v,2.7-2*v,2.7-2*v]);
        }
        if (v != 0 && v != 1){
            return superficieBarrido(0,v,forma,recorrido, matrizTransformacion);
        } else if (v == 0) {
            return [-0.5 + (1 / filasTotales),0,0];
        } else if (v == 1) {
            return [0.5 - (1 / filasTotales),0,0];
        }

    }

    this.getNormal=function(alfa,beta,filasTotales,columnasTotales){
        var p=this.getPosicion(alfa,beta,filasTotales,columnasTotales);
        var v=vec3.create();
        vec3.normalize(v,p);

        var delta = 0.001;
        var p1=this.getPosicion(alfa,beta,filasTotales,columnasTotales);
        var p2=this.getPosicion(alfa,beta+delta,filasTotales,columnasTotales);
        var p3=this.getPosicion(alfa+delta,beta,filasTotales,columnasTotales);

        var v1=vec3.fromValues(p2[0]-p1[0],p2[1]-p1[1],p2[2]-p1[2]);
        var v2=vec3.fromValues(p3[0]-p1[0],p3[1]-p1[1],p3[2]-p1[2]);

        vec3.normalize(v1,v1);
        vec3.normalize(v2,v2);
        
        var n=vec3.create();
        vec3.cross(n,v1,v2);
        //vec3.scale(n,n,-1);
        return n;
    }

    this.getCoordenadasTextura=function(u,v){
        return [u,v];
    }
}

function ModuloNucleo_2() {
    
    this.getPosicion=function(u,v,filasTotales,columnasTotales){
        var u_curva = u * 2;
        var puntosdeControlForma = [[-0.25,0,0],[-0.25,0.3,0],[0.25,0.3,0],[0.25,0,0],[0.25,0,0],[0.25,-0.3,0],[-0.25,-0.3,0],[-0.25,0,0]];
        var puntoCurva = evaluarBezierCubica(u_curva,puntosdeControlForma);
        var forma = [puntoCurva[0]];
        var recorrido = [[-0.25,0,0],[-0.08,0,0],[0.08,0,0],[0.25,0,0]];
        var matrizTransformacion = mat4.create();
        var escala = 0.6 + 0.4*Math.sin(Math.PI*v);
        mat4.scale(matrizTransformacion, matrizTransformacion, [escala, escala, escala]);
        if (v != 0 && v != 1){
            return superficieBarrido(0,v,forma,recorrido, matrizTransformacion);
        } else if (v == 0) {
            return [-0.25 + (1 / filasTotales),0,0];
        } else if (v == 1) {
            return [0.25 - (1 / filasTotales),0,0];
        }

    }

    this.getNormal=function(alfa,beta,filasTotales,columnasTotales){
        var p=this.getPosicion(alfa,beta,filasTotales,columnasTotales);
        var v=vec3.create();
        vec3.normalize(v,p);

        var delta = 0.001;
        var p1=this.getPosicion(alfa,beta,filasTotales,columnasTotales);
        var p2=this.getPosicion(alfa,beta+delta,filasTotales,columnasTotales);
        var p3=this.getPosicion(alfa+delta,beta,filasTotales,columnasTotales);

        var v1=vec3.fromValues(p2[0]-p1[0],p2[1]-p1[1],p2[2]-p1[2]);
        var v2=vec3.fromValues(p3[0]-p1[0],p3[1]-p1[1],p3[2]-p1[2]);

        vec3.normalize(v1,v1);
        vec3.normalize(v2,v2);
        
        var n=vec3.create();
        vec3.cross(n,v1,v2);
        //vec3.scale(n,n,-1);
        return n;
    }

    this.getCoordenadasTextura=function(u,v){
        return [u,v];
    }
}

function CapsulaMayor() {
    
    this.getPosicion=function(u,v,filasTotales,columnasTotales){
        var u_curva = u * 2;
        var puntosdeControlForma = [[-0.25,0,0],[-0.25,0.3,0],[0.25,0.3,0],[0.25,0,0],[0.25,0,0],[0.25,-0.3,0],[-0.25,-0.3,0],[-0.25,0,0]];
        var puntoCurva = evaluarBezierCubica(u_curva,puntosdeControlForma);
        var forma = [puntoCurva[0]];
        var recorrido = [[-0.25,0,0],[-0.08,0,0],[0.08,0,0],[0.25,0,0]];
        var matrizTransformacion = mat4.create();
        if (v <= 0.8) {
            var escala = 0.4 + 0.6*Math.sin(Math.PI*v*0.5/0.8);
        } else {
            var escala = 2.6-v*2;
        }
        mat4.scale(matrizTransformacion, matrizTransformacion, [escala, escala, escala]);
        if (v != 0 && v != 1){
            return superficieBarrido(0,v,forma,recorrido, matrizTransformacion);
        } else if (v == 0) {
            return [-0.25 + (1 / filasTotales),0,0];
        } else if (v == 1) {
            return [0.25 - (1 / filasTotales),0,0];
        }

    }

    this.getNormal=function(alfa,beta,filasTotales,columnasTotales){
        if (beta == 0) return [-1,0,0];
        else if (beta == 1) return [1,0,0];
        var p=this.getPosicion(alfa,beta,filasTotales,columnasTotales);
        var v=vec3.create();
        vec3.normalize(v,p);

        var delta = 0.001;
        var p1=this.getPosicion(alfa,beta,filasTotales,columnasTotales);
        var p2=this.getPosicion(alfa,beta+delta,filasTotales,columnasTotales);
        var p3=this.getPosicion(alfa+delta,beta,filasTotales,columnasTotales);

        var v1=vec3.fromValues(p2[0]-p1[0],p2[1]-p1[1],p2[2]-p1[2]);
        var v2=vec3.fromValues(p3[0]-p1[0],p3[1]-p1[1],p3[2]-p1[2]);

        vec3.normalize(v1,v1);
        vec3.normalize(v2,v2);
        
        var n=vec3.create();
        vec3.cross(n,v1,v2);
        //vec3.scale(n,n,-1);
        return n;
    }

    this.getCoordenadasTextura=function(u,v){
        return [u,v];
    }
}

function CapsulaMenor() {
    
    this.getPosicion=function(u,v,filasTotales,columnasTotales){
        var u_curva = u * 2;
        var puntosdeControlForma = [[-0.25,0,0],[-0.25,0.3,0],[0.25,0.3,0],[0.25,0,0],[0.25,0,0],[0.25,-0.3,0],[-0.25,-0.3,0],[-0.25,0,0]];
        var puntoCurva = evaluarBezierCubica(u_curva,puntosdeControlForma);
        var forma = [puntoCurva[0]];
        var recorrido = [[-0.25,0,0],[-0.08,0,0],[0.08,0,0],[0.25,0,0]];
        var matrizTransformacion = mat4.create();
        var escala = 0.3 + 0.7*Math.sin(Math.PI*v*0.5);
        mat4.scale(matrizTransformacion, matrizTransformacion, [escala, escala, escala]);
        return superficieBarrido(0,v,forma,recorrido, matrizTransformacion);
    }

    this.getNormal=function(alfa,beta,filasTotales,columnasTotales){
        var p=this.getPosicion(alfa,beta,filasTotales,columnasTotales);
        var v=vec3.create();
        vec3.normalize(v,p);

        var delta = 0.001;
        var p1=this.getPosicion(alfa,beta,filasTotales,columnasTotales);
        var p2=this.getPosicion(alfa,beta+delta,filasTotales,columnasTotales);
        var p3=this.getPosicion(alfa+delta,beta,filasTotales,columnasTotales);

        var v1=vec3.fromValues(p2[0]-p1[0],p2[1]-p1[1],p2[2]-p1[2]);
        var v2=vec3.fromValues(p3[0]-p1[0],p3[1]-p1[1],p3[2]-p1[2]);

        vec3.normalize(v1,v1);
        vec3.normalize(v2,v2);
        
        var n=vec3.create();
        vec3.cross(n,v1,v2);
        //vec3.scale(n,n,-1);
        return n;
    }

    this.getCoordenadasTextura=function(u,v){
        return [u,v];
    }
}

function Plano(ancho,largo, invertirNormal = false){

    this.getPosicion=function(u,v,filasTotales,columnasTotales){

        var x=(u-0.5)*ancho;
        var z=(v-0.5)*largo;
        return [x,0,z];
    }

    this.getNormal=function(u,v){
        if (invertirNormal) return [0,-1,0];
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
        //vec3.scale(n,n,-1);
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
        //vec3.scale(n,n,-1);

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

