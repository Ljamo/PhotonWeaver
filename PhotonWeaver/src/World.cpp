/*#include "World.h"

World::World(int width, int height) : width(width), height(height), camera(width, height, glm::vec3(0.0f, 0.0f, 2.0f)) {
    setupOpenGL();
    setupShaders();
    setupBuffers();
}

World::~World() {
    cleanup();
}

void World::run() {
    double lastTime = glfwGetTime();
    int nbFrames = 0;

    while (!glfwWindowShouldClose(window)) {
        float currentFrame = glfwGetTime();
        float deltaTime = currentFrame - lastFrame;
        lastFrame = currentFrame;

        handleInput(deltaTime);

        render();

        calculateFPS(currentFrame, lastTime, nbFrames);
    }
}

void World::setupOpenGL() {
    if (!glfwInit()) {
        std::cout << "Failed to initialize GLFW" << std::endl;
        std::exit(-1);
    }

    glfwWindowHint(GLFW_CONTEXT_VERSION_MAJOR, 3);
    glfwWindowHint(GLFW_CONTEXT_VERSION_MINOR, 3);
    glfwWindowHint(GLFW_OPENGL_PROFILE, GLFW_OPENGL_CORE_PROFILE);

    window = glfwCreateWindow(width, height, "PhotonWeaver", NULL, NULL);
    if (!window) {
        std::cout << "Failed to create GLFW window" << std::endl;
        glfwTerminate();
        std::exit(-1);
    }

    glfwMakeContextCurrent(window);
    glfwSetFramebufferSizeCallback(window, framebuffer_size_callback);

    if (!gladLoadGLLoader((GLADloadproc)glfwGetProcAddress)) {
        std::cout << "Failed to initialize GLAD" << std::endl;
        glfwTerminate();
        std::exit(-1);
    }

    glViewport(0, 0, width, height);
}

void World::setupShaders() {
    shader = Shader("E:\\.Dev\\PhotonWeaver\\PhotonWeaver\\src\\shaders\\default.vert", "E:\\.Dev\\PhotonWeaver\\PhotonWeaver\\src\\shaders\\default.frag");
    shader.use();
    shader.setFloat("aspectRatio", static_cast<float>(width) / static_cast<float>(height));
}

void World::setupBuffers() {
    float quadVertices[] = {
            -1.0f,  1.0f,   0.0f, 1.0f,
            -1.0f, -1.0f,   0.0f, 0.0f,
             1.0f, -1.0f,   1.0f, 0.0f,

            -1.0f,  1.0f,   0.0f, 1.0f,
             1.0f, -1.0f,   1.0f, 0.0f,
             1.0f,  1.0f,   1.0f, 1.0f
    };

    vbo = VBO(quadVertices, sizeof(quadVertices));
    vao = VAO();
    vao.Bind();
    vao.LinkAttrib(vbo, 0, 2, GL_FLOAT, 4 * sizeof(float), (void*)0);
    vao.LinkAttrib(vbo, 1, 2, GL_FLOAT, 4 * sizeof(float), (void*)(2 * sizeof(float)));
    vao.Unbind();
}

void World::handleInput(float deltaTime) {
    glfwPollEvents();
    camera.Inputs(window, deltaTime);
    camera.updateMatrix(45.0f, 0.1f, 100.0f);
}

void World::render() {
    glClearColor(0.2f, 0.3f, 0.3f, 1.0f);
    glClear(GL_COLOR_BUFFER_BIT);

    shader.use();

    shader.setVec3("camPos", camera.Position);
    shader.setVec3("camDir", camera.Orientation);
    shader.setVec3("camUp", camera.Up);
    shader.setFloat("fov", fov);
    shader.setVec3("sphereCenter", sphereCenter);
    shader.setFloat("sphereRadius", sphereRadius);
    shader.setVec4("materialColor", materialColor);
    shader.setFloat("aspectRatio", static_cast<float>(width) / static_cast<float>(height));

    vao.Bind();
    glDrawArrays(GL_TRIANGLES, 0, 6);
    vao.Unbind();

    glfwSwapBuffers(window);
}

void World::calculateFPS(float currentFrame, double& lastTime, int& nbFrames) {
    nbFrames++;
    if (currentFrame - lastTime >= 1.0) {
        std::string title = "PhotonWeaver - FPS: " + std::to_string(nbFrames);
        glfwSetWindowTitle(window, title.c_str());
        nbFrames = 0;
        lastTime += 1.0;
    }
}

void World::framebuffer_size_callback(GLFWwindow* window, int width, int height) {
    glViewport(0, 0, width, height);
}

void World::cleanup() {
    vao.Delete();
    vbo.Delete();
    glfwTerminate();
}
*/