#version 330 core
layout (location = 0) in vec2 aPos; // Full-screen quad vertices
layout (location = 1) in vec2 aTexCoords; // Full-screen quad texture coordinates

out vec2 TexCoords;

void main() {
    TexCoords = aTexCoords;
    gl_Position = vec4(aPos.x, aPos.y, 0.0, 1.0); // Output position to fragment shader
}
