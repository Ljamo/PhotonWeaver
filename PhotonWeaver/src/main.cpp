#include "pch.h"
#include "Shader.h"
#include "VAO.h"
#include "VBO.h"
#include "EBO.h"

// Set Variables
glm::vec3 camPos = glm::vec3(0.0f, 0.0f, 3.0f);
glm::vec3 camDir = glm::vec3(0.0f, 0.0f, -1.0f);
glm::vec3 camUp = glm::vec3(0.0f, 1.0f, 0.0f);
float fov = 60.0f;
float aspectRatio = 800.0f / 600.0f;
glm::vec3 sphereCenter = glm::vec3(0.0f, 0.0f, -5.0f);
float sphereRadius = 1.0f;
glm::vec4 materialColor = glm::vec4(1.0f, 0.0f, 0.0f, 1.0f);

Shader* globalShader = nullptr; // Initialize to nullptr
auto width = 800;
auto height = 600;


float vertices[] = {
     0.5f,  0.5f, 0.0f,  // top right
     0.5f, -0.5f, 0.0f,  // bottom right
    -0.5f, -0.5f, 0.0f,  // bottom left
    -0.5f,  0.5f, 0.0f   // top left 
};
unsigned int indices[] = {  // note that we start from 0!
    0, 1, 3,   // first triangle
    1, 2, 3    // second triangle
};


float quadVertices[] = {
    // positions    // texCoords
    -1.0f,  1.0f,   0.0f, 1.0f,
    -1.0f, -1.0f,   0.0f, 0.0f,
     1.0f, -1.0f,   1.0f, 0.0f,

    -1.0f,  1.0f,   0.0f, 1.0f,
     1.0f, -1.0f,   1.0f, 0.0f,
     1.0f,  1.0f,   1.0f, 1.0f
};


/*
// Temp Shaders 
const char* vertexShaderSource = "#version 330 core\n"
"layout (location = 0) in vec3 aPos;\n"
"void main()\n"
"{\n"
"   gl_Position = vec4(aPos.x, aPos.y, aPos.z, 1.0);\n"
"}\0";

const char* fragmentShaderSource = "#version 330 core\n"
"out vec4 FragColour;\n"
"void main()\n"
"{\n"
"    FragColour = vec4(1.0f, 0.5f, 0.2f, 1.0f);\n"
"}\0";
*/

void framebuffer_size_callback(GLFWwindow* window, int width, int height) {
    // Update the viewport and the aspect ratio uniform
    glViewport(0, 0, width, height);
    if (globalShader != nullptr) {
        globalShader->use();
        globalShader->setFloat("aspectRatio", static_cast<float>(width) / static_cast<float>(height));
    }
}


int main() {
    // Initialize GLFW
    if (!glfwInit()) {
        std::cout << "Failed to initialize GLFW" << std::endl;
        return -1;
    }

    glfwWindowHint(GLFW_CONTEXT_VERSION_MAJOR, 3);
    glfwWindowHint(GLFW_CONTEXT_VERSION_MINOR, 3);
    glfwWindowHint(GLFW_OPENGL_PROFILE, GLFW_OPENGL_CORE_PROFILE);

    // Create a GLFWwindow object
    GLFWwindow* window = glfwCreateWindow(width, height, "PhotonWeaver", NULL, NULL);
    if (window == NULL) {
        std::cout << "Failed to create GLFW window" << std::endl;
        glfwTerminate();
        return -1;
    }

    // Make the window's context current
    glfwMakeContextCurrent(window);
    glfwSetFramebufferSizeCallback(window, framebuffer_size_callback);

    // Initialize GLAD
    if (!gladLoadGLLoader((GLADloadproc)glfwGetProcAddress)) {
        std::cout << "Failed to initialize GLAD" << std::endl;
        glfwTerminate();
        return -1;
    }

    // Set the viewport
    glViewport(0, 0, 800, 600);

    // Shader instantiation
    Shader shader("E:\\.Dev\\PhotonWeaver\\PhotonWeaver\\src\\shaders\\test.vert", "E:\\.Dev\\PhotonWeaver\\PhotonWeaver\\src\\shaders\\test.frag");
    globalShader = &shader;


    // VBO and VAO instantiation
    VBO vbo(quadVertices, sizeof(quadVertices));
    VAO vao;

    // Bind VAO and link it with VBO
    vao.Bind();
    vao.LinkAttrib(vbo, 0, 2, GL_FLOAT, 4 * sizeof(float), (void*)0);
    vao.LinkAttrib(vbo, 1, 2, GL_FLOAT, 4 * sizeof(float), (void*)(2 * sizeof(float)));
    vao.Unbind();  // Unbind VAO to prevent unintended modifications.

    // Optional EBO setup, if you use indexed drawing
    EBO ebo(indices, sizeof(indices));

    float lastFrame = 0.0f; // Time of last frame
    float deltaTime = 0.0f; // Time between current frame and last frame

    shader.use();
    shader.setFloat("aspectRatio", width / height);

    double lastTime = glfwGetTime();
    int nbFrames = 0;


    // Main loop
    while (!glfwWindowShouldClose(window)) {
       
        double currentTime = glfwGetTime();
        nbFrames++;

        // Check if one second has passed
        if (currentTime - lastTime >= 1.0) {
            // Update the window title with the FPS count
            std::string title = "PhotonWeaver - FPS: " + std::to_string(nbFrames);
            glfwSetWindowTitle(window, title.c_str());

            // Reset timer and frame count
            nbFrames = 0;
            lastTime += 1.0;
        }

        glClearColor(0.2f, 0.3f, 0.3f, 1.0f);
        glClear(GL_COLOR_BUFFER_BIT);

        shader.use();

        shader.setVec3("camPos", camPos);
        shader.setVec3("camDir", camDir);
        shader.setVec3("camUp", camUp);
        shader.setFloat("fov", fov);

        // Set sphere uniforms
        shader.setVec3("sphereCenter", sphereCenter);
        shader.setFloat("sphereRadius", sphereRadius);

        // Set material color uniform
        shader.setVec4("materialColor", materialColor);

        // Since aspect ratio can change with window resizing, set it in the framebuffer size callback
        shader.setFloat("aspectRatio", aspectRatio);

        vao.Bind();

        glDrawArrays(GL_TRIANGLES, 0, 6);  // Or glDrawElements if using EBO


        glfwSwapBuffers(window);
        glfwPollEvents();
    }

    vao.Delete();
    vbo.Delete();
    ebo.Delete();  // If using EBO

    // Terminate GLFW
    glfwTerminate();
    return 0;
    return 0;
}
