#version 330 core
layout(location = 0) in vec2 aPos; // Position of the vertex
layout(location = 1) in vec2 aTexCoords; // Texture coordinates

out vec2 TexCoords;

void main() {
    TexCoords = aTexCoords;
    gl_Position = vec4(aPos.x, aPos.y, 0.0, 1.0); // Convert to vec4
}
