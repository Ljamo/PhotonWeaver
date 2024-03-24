#ifndef VAO_H
#define VAO_H

#include "pch.h"
#include "VBO.h"

class VAO {
public:
    GLuint ID;

    VAO();

    void LinkAttrib(VBO& vbo, GLuint layout, GLuint numComponents, GLenum type, GLsizeiptr stride, void* offset);

    void Bind() const;

    void Unbind() const;

    void Delete();
};

#endif // !VAO_H
