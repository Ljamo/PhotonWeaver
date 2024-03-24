#ifndef EBO_H
#define EBO_H

#include "pch.h"

class EBO {
public:
    GLuint ID;

    EBO(const GLuint* indices, GLsizeiptr size);

    void Bind() const;

    void Unbind() const;

    void Delete();
};

#endif // !EBO
