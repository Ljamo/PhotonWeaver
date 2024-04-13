#include "pch.h"
#include "Shader.h"
#include "VAO.h"
#include "VBO.h"
#include "EBO.h"
#include "Camera.h"

// Set Variables
// glm::vec3 camPos = glm::vec3(0.0f, 0.0f, 3.0f);
// glm::vec3 camDir = glm::vec3(0.0f, 0.0f, -1.0f);
// glm::vec3 camUp = glm::vec3(0.0f, 1.0f, 0.0f);
float fov = 60.0f;
glm::vec3 sphereCenter = glm::vec3(0.0f, 0.0f, -5.0f);
float aspectRatio = 800.0f / 600.0f;
float sphereRadius = 1.0f;
glm::vec4 materialColor = glm::vec4(1.0f, 0.0f, 0.0f, 1.0f);

Shader* globalShader = nullptr; // Initialize to nullptr
auto width = 800;
auto height = 600;



//float samples_per_pixel = 1.0f;
//float pixel_sample_square = 1.0f;

float quadVertices[] = {
	// positions    // texCoords
	-1.0f,  1.0f,   0.0f, 1.0f,
	-1.0f, -1.0f,   0.0f, 0.0f,
	 1.0f, -1.0f,   1.0f, 0.0f,

	-1.0f,  1.0f,   0.0f, 1.0f,
	 1.0f, -1.0f,   1.0f, 0.0f,
	 1.0f,  1.0f,   1.0f, 1.0f
};

void framebuffer_size_callback(GLFWwindow* window, int newWidth, int newHeight) {
	// Update the viewport
	glViewport(0, 0, newWidth, newHeight);

	// Update width and height variables
	width = newWidth;
	height = newHeight;

	// Update aspect ratio
	aspectRatio = static_cast<float>(width) / static_cast<float>(height);

	// Update the aspect ratio uniform in the shader if the shader is available
	if (globalShader != nullptr) {
		globalShader->use();
		globalShader->setFloat("aspectRatio", aspectRatio);
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
	//glfwSwapInterval(0); // Disable VSync

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
	std::string vertDir = parentDir + "\\PhotonWeaver\\src\\shaders\\Ray.vert";
	std::string fragDir = parentDir + "\\PhotonWeaver\\src\\shaders\\Ray.frag";

	Shader shader(vertDir.c_str(), fragDir.c_str());
	globalShader = &shader;

	Camera camera(width, height, glm::vec3(0.0f, 0.0f, 2.0f));

	// VBO and VAO instantiation
	VBO vbo(quadVertices, sizeof(quadVertices));
	VAO vao;

	// Bind VAO and link it with VBO
	vao.Bind();
	vao.LinkAttrib(vbo, 0, 2, GL_FLOAT, 4 * sizeof(float), (void*)0);
	vao.LinkAttrib(vbo, 1, 2, GL_FLOAT, 4 * sizeof(float), (void*)(2 * sizeof(float)));
	vao.Unbind();  // Unbind VAO to prevent unintended modifications.

	float lastFrame = 0.0f; // Time of last frame
	float deltaTime = 0.0f; // Time between current frame and last frame

	float cameraSpeed = 1.0f;


	shader.use();
	shader.setFloat("aspectRatio", width / height);

	double lastTime = glfwGetTime();
	int nbFrames = 0;

	// Main loop
	while (!glfwWindowShouldClose(window))
	{
		float currentFrame = glfwGetTime();
		deltaTime = currentFrame - lastFrame;
		lastFrame = currentFrame;

		// Input handling (example: camera movement)
		// Update FPS counter
		nbFrames++;
		if (currentFrame - lastTime >= 1.0) {
			// Update the window title with the FPS count
			std::string title = "PhotonWeaver - FPS: " + std::to_string(nbFrames);
			glfwSetWindowTitle(window, title.c_str());

			// Reset timer and frame count
			nbFrames = 0;
			lastTime += 1.0;
		}

		// Rendering
		glClearColor(0.2f, 0.3f, 0.3f, 1.0f);
		glClear(GL_COLOR_BUFFER_BIT);

		camera.Inputs(window, deltaTime);
		camera.updateMatrix(45.0f, 0.1f, 100.0f);

		shader.use();

		// Update camera uniforms
		shader.setVec3("camPos", camera.Position);
		shader.setVec3("camDir", camera.Orientation);
		shader.setVec3("camUp", camera.Up);
		shader.setFloat("fov", fov);
		//shader.setInt("pixel_sample_square", pixel_sample_square);
		//shader.setInt("samples_per_pixel", samples_per_pixel);

		// Set sphere uniforms
		shader.setVec3("sphereCenter", sphereCenter);
		shader.setFloat("sphereRadius", sphereRadius);

		shader.setFloat("width", (float)width);
		shader.setFloat("height", (float)height);

		// Set material color uniform
		shader.setVec4("materialColor", materialColor);

		// Since aspect ratio can change with window resizing,
		// set it in the framebuffer size callback
		shader.setFloat("aspectRatio", aspectRatio);

		vao.Bind();

		glDrawArrays(GL_TRIANGLES, 0, 6);  // Or glDrawElements if using EBO

		camera.setSpeed(cameraSpeed);

		// Swap buffers and poll events
		glfwSwapBuffers(window);
		glfwPollEvents();
	}

	vao.Delete();
	vbo.Delete();
	// ebo.Delete();  // If using EBO

	// Terminate GLFW
	glfwTerminate();
	return 0;
}
