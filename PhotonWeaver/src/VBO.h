#ifndef VBO_H
#define VBO_H
#include "pch.h"

class VBO {
public:
    GLuint ID;

    VBO(const void* vertices, GLsizeiptr size);

    void Bind() const;

    void Unbind() const;

    void Delete();
};

#endif // !VBO_H
