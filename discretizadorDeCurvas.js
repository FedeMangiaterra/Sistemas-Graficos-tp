// bases bezier cubicas
var Base0b3=function(u) { return (1-u)*(1-u)*(1-u);}  // 1*(1-u) - u*(1-u) = 1-2u+u2  ,  (1-2u+u2) - u +2u2- u3 ,  1 - 3u +3u2 -u3

var Base1b3=function(u) { return 3*(1-u)*(1-u)*u; } // 3*(1-u)*(u-u2) , 3*(u-u2-u2+u3), 3u -6u2+2u3

var Base2b3=function(u) { return 3*(1-u)*u*u;} //3u2-3u3

var Base3b3=function(u) { return u*u*u; }

// bases bezier cubica derivadas

var Base0b3der=function(u) { return -3*u*u+6*u-3;} //-3u2 +6u -3

var Base1b3der=function(u) { return 9*u*u-12*u+3; }  // 9u2 -12u +3

var Base2b3der=function(u) { return -9*u*u+6*u;}		 // -9u2 +6u

var Base3b3der=function(u) { return 3*u*u; }


var curvaBezierCubica=function (u,puntosDeControl,pos){

    var p0=puntosDeControl[pos];
    var p1=puntosDeControl[pos+1];
    var p2=puntosDeControl[pos+2];
    var p3=puntosDeControl[pos+3];

    var x=Base0b3(u)*p0[0]+Base1b3(u)*p1[0]+Base2b3(u)*p2[0]+Base3b3(u)*p3[0];
    var y=Base0b3(u)*p0[1]+Base1b3(u)*p1[1]+Base2b3(u)*p2[1]+Base3b3(u)*p3[1];
    var z=Base0b3(u)*p0[2]+Base1b3(u)*p1[2]+Base2b3(u)*p2[2]+Base3b3(u)*p3[2];

    var pos = [x,y,z];

    var derx = Base0b3der(u)*p0[0]+Base1b3der(u)*p1[0]+Base2b3der(u)*p2[0]+Base3b3der(u)*p3[0];
    var dery = Base0b3der(u)*p0[1]+Base1b3der(u)*p1[1]+Base2b3der(u)*p2[1]+Base3b3der(u)*p3[1];
    var derz = Base0b3der(u)*p0[2]+Base1b3der(u)*p1[2]+Base2b3der(u)*p2[2]+Base3b3der(u)*p3[2];

    var tangente = vec3.fromValues(derx,dery,derz);
    vec3.normalize(tangente,tangente);

    var normal = [0,0,1]; //Asumo que el plano de la curva es el xy

    var binormal = vec3.create();
    vec3.cross(binormal, tangente, normal);
    //vec3.normalize(binormal, binormal);

    return [pos, tangente, normal, binormal];
}

function crearBezierCubica(puntosDeControl) {
    var puntosARecorrer = puntosDeControl.length;
    puntosCurva = [];
    var puntosRecorridos = 0;
    while (puntosRecorridos < puntosARecorrer) {
        var u = 0;
        var delta = 0.01;
        while (u < 1.01) {
            puntosCurva.push(curvaBezierCubica(u,puntosDeControl,puntosRecorridos));
            u += delta;
        }
        puntosRecorridos += 4;
    }
    console.log(puntosCurva);
    return puntosCurva
}

function evaluarBezierCubica(u, puntosDeControl) {
    var parteEntera = Math.trunc(u);
    var parteDecimal = u - parteEntera;
    var puntoInicial = 0;
    if (parteEntera > 0) { 
        puntoInicial = 4 * parteEntera;
    }
    if (puntoInicial >= puntosDeControl.length) {
        puntoInicial -= 4;
        parteDecimal = 1;
    }
    return curvaBezierCubica(parteDecimal,puntosDeControl,puntoInicial);
}


function discretizarCurva(cant_puntos, puntos_curva) {
    var puntos = [];
    var delta = Math.round(puntos_curva.length/(cant_puntos-1));
    var i = 0;
    var pos = 0;
    while (pos < puntos_curva.length-1) {
        puntos[i] = puntos_curva[pos];
        i++;
        pos += delta;
    }
    puntos[i] = puntos_curva[puntos_curva.length-1];
    console.log(puntos);
    return puntos;
}