function indice(fila, columna, verticesPorFila){
    return fila*verticesPorFila + columna;
}

function generarSuperficie(superficie,filas,columnas){

    positionBuffer = [];
    normalBuffer = [];
    uvBuffer = [];

    for (var i=0; i <= filas; i++) {
        for (var j=0; j <= columnas; j++) {

            var u=j/columnas;
            var v=i/filas;

            var pos=superficie.getPosicion(u,v,filas,columnas);

            positionBuffer.push(pos[0]);
            positionBuffer.push(pos[1]);
            positionBuffer.push(pos[2]);

            var nrm=superficie.getNormal(u,v,filas,columnas);

            normalBuffer.push(nrm[0]);
            normalBuffer.push(nrm[1]);
            normalBuffer.push(nrm[2]);

            var uvs=superficie.getCoordenadasTextura(u,v);

            uvBuffer.push(uvs[0]);
            uvBuffer.push(uvs[1]);

        }
    }
    indexBuffer=[];  
    for (i=0; i < filas; i++) {
        for (j=0; j <= columnas; j++) {
            indexBuffer.push(indice(i, j, columnas+1));
            indexBuffer.push(indice(i+1, j, columnas+1));
            if (j == columnas && i != filas-1){
                indexBuffer.push(indice(i+1, j, columnas+1));
                indexBuffer.push(indice(i+1, 0, columnas+1));
            }        
        }
    }
    return {positionBuffer, normalBuffer, uvBuffer, indexBuffer};
}

class Objeto3D {
    constructor() {
        this.positionBuffer = null;
        this.normalBuffer = null;
        this.uvBuffer = null;
        this.indexBuffer = null;
        this.matrizModelado = mat4.create();
        this.matrizNormal = mat4.create();
        this.posicion = [0,0,0];
        this.rotacion = [1,0,0];
        this.angulo = 0;
        this.escala = [1,1,1];
        this.hijos = [];
    }

    actualizarMatrizModelado() {
        if (this.posicion != [0,0,0]) { 
            mat4.translate(this.matrizModelado, this.matrizModelado, this.posicion);
        }
        if (this.angulo != 0) { 
            mat4.rotate(this.matrizModelado, this.matrizModelado, this.angulo, this.rotacion);
        }
        if (this.escala != [1,1,1]) {
            mat4.scale(this.matrizModelado, this.matrizModelado, this.escala);
        }
        mat4.identity(this.matrizNormal);
        mat4.multiply(this.matrizNormal,viewMatrix,this.matrizModelado);
        mat4.invert(this.matrizNormal,this.matrizNormal);
        mat4.transpose(this.matrizNormal,this.matrizNormal);
    }

    setupVertexShaderMatrix(){
        var modelMatrixUniform = gl.getUniformLocation(glProgram, "modelMatrix");
        var normalMatrixUniform = gl.getUniformLocation(glProgram, "normalMatrix");

        gl.uniformMatrix4fv(modelMatrixUniform, false, this.matrizModelado);
        gl.uniformMatrix4fv(normalMatrixUniform, false, this.matrizNormal);
    }       

    setearBuffers(superficie, filas, columnas) {
        var mallaDeTriangulos = generarSuperficie(superficie, filas, columnas);

        var webgl_position_buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, webgl_position_buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(mallaDeTriangulos.positionBuffer), gl.STATIC_DRAW);
        webgl_position_buffer.itemSize = 3;
        webgl_position_buffer.numItems = positionBuffer.length / 3;

        var webgl_normal_buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, webgl_normal_buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(mallaDeTriangulos.normalBuffer), gl.STATIC_DRAW);
        webgl_normal_buffer.itemSize = 3;
        webgl_normal_buffer.numItems = normalBuffer.length / 3;

        var webgl_uvs_buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, webgl_uvs_buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(mallaDeTriangulos.uvBuffer), gl.STATIC_DRAW);
        webgl_uvs_buffer.itemSize = 2;
        webgl_uvs_buffer.numItems = uvBuffer.length / 2;

        var webgl_index_buffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, webgl_index_buffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(mallaDeTriangulos.indexBuffer), gl.STATIC_DRAW);
        webgl_index_buffer.itemSize = 1;
        webgl_index_buffer.numItems = indexBuffer.length;

        this.positionBuffer = webgl_position_buffer;
        this.normalBuffer = webgl_normal_buffer;
        this.uvBuffer = webgl_uvs_buffer;
        this.indexBuffer = webgl_index_buffer;
    }

    dibujar(matrizPadre) {
        var m = mat4.create();
        this.actualizarMatrizModelado();
        mat4.multiply(m, matrizPadre, this.matrizModelado);
        this.matrizModelado = m;

        if (this.indexBuffer && this.positionBuffer) {
            this.setupVertexShaderMatrix();

            vertexPositionAttribute = gl.getAttribLocation(glProgram, "aVertexPosition");
            gl.enableVertexAttribArray(vertexPositionAttribute);
            gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
            gl.vertexAttribPointer(vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);

            vertexNormalAttribute = gl.getAttribLocation(glProgram, "aVertexNormal");
            gl.enableVertexAttribArray(vertexNormalAttribute);
            gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
            gl.vertexAttribPointer(vertexNormalAttribute, 3, gl.FLOAT, false, 0, 0);
            
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
            gl.drawElements(gl.TRIANGLE_STRIP, this.indexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
        }
        for (var i = 0; i < this.hijos.length; i++){
            this.hijos[i].dibujar(m);
        }
    }

    agregarHijo(hijo) {
        this.hijos.push(hijo);
    }

    setPosicion(x,y,z) {
        this.posicion = [x,y,z];
    }

    setRotacion(x,y,z,angulo) {
        this.rotacion = [x,y,z];
        this.angulo = angulo;
    }

    setEscala(x,y,z) {
        this.escala = [x,y,z];
    }

    dibujarr(superficie) {
        var mallaDeTriangulos;
        mallaDeTriangulos = generarSuperficie(superficie, 50, 50);
        this.setearBuffers(mallaDeTriangulos);
        this.dibujar(mat4.create());
    }
}