function loadTextures(gl, textures, callback) {
    var texturas = [];
    var imagenes_a_cargar = textures.length;
    var alCargarImagen = function() {
        --imagenes_a_cargar;
        // If all the images are loaded call the callback.
        if (imagenes_a_cargar == 0) {
          callback(texturas);
        }
      };
    for (i = 0; i < textures.length; i++) {
        var textura = loadTexture(gl, textures[i], alCargarImagen);
        texturas.push(textura);
    }
}

function loadTexture(gl, url, callback) {
    var texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
  
    const level = 0;
    const internalFormat = gl.RGBA;
    const width = 1;
    const height = 1;
    const border = 0;
    const srcFormat = gl.RGBA;
    const srcType = gl.UNSIGNED_BYTE;
    const pixel = new Uint8Array([0, 0, 255, 255]);  // opaque blue
    gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
                  width, height, border, srcFormat, srcType,
                  pixel);
  
    const image = new Image();
    image.src = url;
    image.onload = function() {
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
                    srcFormat, srcType, image);
  
      if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
         gl.generateMipmap(gl.TEXTURE_2D);
      } else {
         gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
         gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
         gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      }
      gl.bindTexture(gl.TEXTURE_2D, null);
      callback();
    };
  
    return texture;
  }
  
  function isPowerOf2(value) {
    return (value & (value - 1)) == 0;
  }

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

class Metal {
    constructor() {
        this.constanteAmbiental = 1.0;
        this.constanteDifusa = 1.0;
        this.constanteEspecular = 1.0;
        this.brillo = 5.0;
    }

    getAmbiental() {
        return this.constanteAmbiental;
    }

    getDifusa() {
        return this.constanteDifusa;
    }

    getEspecular() {
        return this.constanteEspecular;
    }

    getBrillo() {
        return this.brillo;
    }
}

class Piedra {
    constructor() {
        this.constanteAmbiental = 2.0;
        this.constanteDifusa = 1.0;
        this.constanteEspecular = 0.2;
        this.brillo = 5.0;
    }

    getAmbiental() {
        return this.constanteAmbiental;
    }

    getDifusa() {
        return this.constanteDifusa;
    }

    getEspecular() {
        return this.constanteEspecular;
    }

    getBrillo() {
        return this.brillo;
    }
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
        this.colorObjeto = [1,1,1];
        this.matrizActualizada = false;
        this.texture = null;
        this.mapaReflexion = null;
        this.indiceTextura = 0;
        this.indiceMapaReflexion = 0;
        this.material = new Metal;
    }

    setearTextura(texture, indice, mapaReflexion, indiceMapaReflexion) {
        this.texture = texture;
        this.indiceTextura = indice;
        this.mapaReflexion = mapaReflexion;
        this.indiceMapaReflexion = indiceMapaReflexion;
    }

    actualizarMatrizModelado() {
        if (this.matrizActualizada) return;
        if (this.posicion != [0,0,0]) { 
            mat4.translate(this.matrizModelado, this.matrizModelado, this.posicion);
        }
        if (this.angulo != 0) { 
            mat4.rotate(this.matrizModelado, this.matrizModelado, this.angulo, this.rotacion);
        }
        if (this.escala != [1,1,1]) {
            mat4.scale(this.matrizModelado, this.matrizModelado, this.escala);
        }
        
        this.matrizActualizada = true;
    }

    setupVertexShaderMatrix(){
        var modelMatrixUniform = gl.getUniformLocation(glProgram, "modelMatrix");
        var normalMatrixUniform = gl.getUniformLocation(glProgram, "normalMatrix");


        var direccion_luz_solar = [3,10,5];
        vec3.normalize(direccion_luz_solar, direccion_luz_solar);

        var reverseLightDirectionLocation = gl.getUniformLocation(glProgram, "u_reverseLightDirection");
        gl.uniform3fv(reverseLightDirectionLocation, direccion_luz_solar);

        var ambientLightIntensityLocation = gl.getUniformLocation(glProgram, "ambientLightIntensity");
        var sunlightIntensityLocation = gl.getUniformLocation(glProgram, "sunlightIntensity");
        gl.uniform3fv(ambientLightIntensityLocation, [0.1, 0.1, 0.2]);
        gl.uniform3fv(sunlightIntensityLocation, [1.0,0.9,0.8]);

        var greenLightWorldPositionLocation = gl.getUniformLocation(glProgram, "greenLightPosition");
        gl.uniform3fv(greenLightWorldPositionLocation, posicionLuzVerde);

        var redLightWorldPositionLocation = gl.getUniformLocation(glProgram, "redLightPosition");
        gl.uniform3fv(redLightWorldPositionLocation, posicionLuzRoja);

        var spotLightWorldPositionLocation = gl.getUniformLocation(glProgram, "spotLightPosition");
        gl.uniform3fv(spotLightWorldPositionLocation, posicionLuzSpot);
        var spotLightDirectionLocation = gl.getUniformLocation(glProgram, "spotLightDirection");
        gl.uniform3fv(spotLightDirectionLocation, direccionLuzSpot);
        var limitLocation = gl.getUniformLocation(glProgram, "u_innerLimit");
        gl.uniform1f(limitLocation, Math.cos(limiteInternoLuzSpot));
        var limitLocation = gl.getUniformLocation(glProgram, "u_outerLimit");
        gl.uniform1f(limitLocation, Math.cos(limiteExternoLuzSpot));

        var viewWorldPositionLocation = gl.getUniformLocation(glProgram, "viewPosition");
        gl.uniform3fv(viewWorldPositionLocation, posicionCamara);

        var ambientConstantLocation = gl.getUniformLocation(glProgram, "ambientConstant");
        gl.uniform1f(ambientConstantLocation, this.material.getAmbiental());
        var diffuseConstantLocation = gl.getUniformLocation(glProgram, "diffuseConstant");
        gl.uniform1f(diffuseConstantLocation, this.material.getDifusa());
        var specularConstantLocation = gl.getUniformLocation(glProgram, "specularConstant");
        gl.uniform1f(specularConstantLocation, this.material.getEspecular());
        var shininessLocation = gl.getUniformLocation(glProgram, "shininess");
        gl.uniform1f(shininessLocation, this.material.getBrillo());

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
        mat4.multiply(this.matrizNormal,mat4.create(),this.matrizModelado);
        mat4.invert(this.matrizNormal,this.matrizNormal);
        mat4.transpose(this.matrizNormal,this.matrizNormal);

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

            var uSampler = gl.getUniformLocation(glProgram, 'uSampler');
            var vertexTextureAttribute = gl.getAttribLocation(glProgram, "aTextureCoord");
            gl.enableVertexAttribArray(vertexTextureAttribute);
            gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer);
            gl.vertexAttribPointer(vertexTextureAttribute, 2, gl.FLOAT, false, 0, 0);

            var reflectionSampler = gl.getUniformLocation(glProgram, 'reflectionSampler');
            var reflectionTextureAttribute = gl.getAttribLocation(glProgram, "aTextureCoord");
            gl.enableVertexAttribArray(reflectionTextureAttribute);
            gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer);
            gl.vertexAttribPointer(reflectionTextureAttribute, 2, gl.FLOAT, false, 0, 0);

            if (this.texture) {
                gl.activeTexture(gl.TEXTURE0+this.indiceTextura);
                gl.bindTexture(gl.TEXTURE_2D, this.texture);
            }
            if (this.mapaReflexion) {
                gl.activeTexture(gl.TEXTURE0+this.indiceMapaReflexion);
                gl.bindTexture(gl.TEXTURE_2D, this.mapaReflexion);
            }
            gl.uniform1i(uSampler, this.indiceTextura);
            gl.uniform1i(reflectionSampler, this.indiceMapaReflexion);
            
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

    getPosicion() {
        return this.posicion;
    }

    setRotacion(x,y,z,angulo) {
        this.rotacion = [x,y,z];
        this.angulo = angulo;
    }

    setEscala(x,y,z) {
        this.escala = [x,y,z];
    }

    setMatrizModelado(matrizModelado) {
        this.matrizModelado = matrizModelado;
    }

    setColor(color) {
        this.colorObjeto = color;
    }

    setMaterial(material) {
        this.material = material;
    }

    getMatrizModelado(matrizPadre) {
        this.actualizarMatrizModelado();
        var m = mat4.create();
        mat4.multiply(m, matrizPadre, this.matrizModelado);
        return m;
        /*var m=mat4.clone(this.matrizModelado);
        if (this.matrizActualizada) return m;
        if (this.posicion != [0,0,0]) { 
            mat4.translate(m, m, this.posicion);
        }
        if (this.angulo != 0) { 
            mat4.rotate(m, m, this.angulo, this.rotacion);
        }
        if (this.escala != [1,1,1]) {
            mat4.scale(m, m, this.escala);
        }
        return m;*/
    }

    getMatrizVista() {
        var m=mat4.clone(this.matrizModelado);            
        mat4.invert(m,m);
        return m;
    }

    dibujarr(superficie) {
        var mallaDeTriangulos;
        mallaDeTriangulos = generarSuperficie(superficie, 50, 50);
        this.setearBuffers(mallaDeTriangulos);
        this.dibujar(mat4.create());
    }
}