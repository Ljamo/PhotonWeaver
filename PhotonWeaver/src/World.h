/*#ifndef WORLD_H
#define WORLD_H

#include "pch.h"
#include "Shader.h"
#include "VAO.h"
#include "VBO.h"
#include "EBO.h"
#include "Camera.h"

class World {
public:
    World(int width, int height);
    ~World();
    void run();

private:
    GLFWwindow* window;
    Shader shader;
    Camera camera;
    VBO vbo;
    VAO vao;
    int width;
    int height;
    float lastFrame = 0.0f;

    void setupOpenGL();
    void setupShaders();
    void setupBuffers();
    void handleInput(float deltaTime);
    void render();
    void calculateFPS(float currentFrame, double& lastTime, int& nbFrames);
    static void framebuffer_size_callback(GLFWwindow* window, int width, int height);
    void cleanup();
};

#endif
*/