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

// bases bspline cubicas

var Base0s3=function(u) { return (1-3*u+3*u*u-u*u*u)*1/6;}  // (1 -3u +3u2 -u3)/6

var Base1s3=function(u) { return (4-6*u*u+3*u*u*u)*1/6; }  // (4  -6u2 +3u3)/6

var Base2s3=function(u) { return (1+3*u+3*u*u-3*u*u*u)*1/6} // (1 -3u +3u2 -3u3)/6

var Base3s3=function(u) { return (u*u*u)*1/6; }  //    u3/6

// bases bspline cubica derivadas

var Base0s3der=function(u) { return (-3 +6*u -3*u*u)/6 }  // (-3 +6u -3u2)/6

var Base1s3der=function(u) { return (-12*u+9*u*u)/6 }   // (-12u +9u2)  /6

var Base2s3der=function(u) { return (3+6*u-9*u*u)/6;}	// (-3 +6u -9u2)/6

var Base3s3der=function(u) { return (3*u*u)*1/6; }

// bases bspline cuadratica

var Base0s2=function(u) { return 0.5*(1-u)*(1-u);}   // 0.5*(1-u)^2

var Base1s2=function(u) { return 0.5+u*(1-u);} 		// 0.5+ u*(1-u)

var Base2s2=function(u) { return 0.5*u*u; } 			// 0.5*u^2

			 
// bases bspline cuadratica derivadas

var Base0s2der=function(u) { return -1+u;}  	//

var Base1s2der=function(u) { return  1-2*u;} 

var Base2s2der=function(u) { return  u;}



var curvaBSplineCuadratica=function(u,puntosDeControl,pos){
    var p0=puntosDeControl[pos];
    var p1=puntosDeControl[pos+1];
    var p2=puntosDeControl[pos+2];

    var x=Base0s2(u)*p0[0]+Base1s2(u)*p1[0]+Base2s2(u)*p2[0];
    var y=Base0s2(u)*p0[1]+Base1s2(u)*p1[1]+Base2s2(u)*p2[1];
    var z=Base0s2(u)*p0[2]+Base1s2(u)*p1[2]+Base2s2(u)*p2[2];

    return [x,y,z];
}

function crearBSplineCuadratica(puntosDeControl) {
    var puntosARecorrer = puntosDeControl.length;
    puntosCurva = [];
    var puntoActual = 0;
    while (puntoActual + 2 < puntosARecorrer) {
        var u = 0;
        var delta = 0.01;
        while (u < 1.01) {
            puntosCurva.push(curvaBSplineCuadratica(u,puntosDeControl,puntoActual));
            u += delta;
        }
        puntoActual += 1;
    }
    console.log(puntosCurva);
    return puntosCurva;
}

var curvaBezierCubica=function (u,puntosDeControl,pos){

    var p0=puntosDeControl[pos];
    var p1=puntosDeControl[pos+1];
    var p2=puntosDeControl[pos+2];
    var p3=puntosDeControl[pos+3];

    var x=Base0b3(u)*p0[0]+Base1b3(u)*p1[0]+Base2b3(u)*p2[0]+Base3b3(u)*p3[0];
    var y=Base0b3(u)*p0[1]+Base1b3(u)*p1[1]+Base2b3(u)*p2[1]+Base3b3(u)*p3[1];
    var z=Base0b3(u)*p0[2]+Base1b3(u)*p1[2]+Base2b3(u)*p2[2]+Base3b3(u)*p3[2];

    return [x,y,z];
}

var curvaBSplineCubica=function (u,puntosDeControl,pos){

    var p0=puntosDeControl[pos];
    var p1=puntosDeControl[pos+1];
    var p2=puntosDeControl[pos+2];
    var p3=puntosDeControl[pos+3];

    var x=Base0s3(u)*p0[0]+Base1s3(u)*p1[0]+Base2s3(u)*p2[0]+Base3s3(u)*p3[0];
    var y=Base0s3(u)*p0[1]+Base1s3(u)*p1[1]+Base2s3(u)*p2[1]+Base3s3(u)*p3[1];
    var z=Base0s3(u)*p0[2]+Base1s3(u)*p1[2]+Base2s3(u)*p2[2]+Base3s3(u)*p3[2];

    return [x,y,z];
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
        puntoInicial = 3 * parteEntera + 1;
    }
    return curvaBezierCubica(parteDecimal,puntosDeControl,puntoInicial);
}

function crearBSplineCubica(puntosDeControl) {
    var puntosARecorrer = puntosDeControl.length;
    puntosCurva = [];
    var puntoActual = 0;
    while (puntoActual + 3 < puntosARecorrer) {
        var u = 0;
        var delta = 0.01;
        while (u < 1.01) {
            puntosCurva.push(curvaBSplineCubica(u,puntosDeControl,puntoActual));
            u += delta;
        }
        puntoActual += 1;
    }
    console.log(puntosCurva);
    return puntosCurva;
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