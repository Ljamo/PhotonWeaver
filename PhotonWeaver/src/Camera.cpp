#include "Camera.h"


Camera::Camera(int width, int height, glm::vec3 position)
{
    Camera::width = width;
    Camera::height = height;
    Position = position;
}

void Camera::updateMatrix(float verticalFOV, float nearClip, float farClip)
{
    // Initializes matrices since otherwise they will be the null matrix
    glm::mat4 view = glm::mat4(1.0f);
    glm::mat4 projection = glm::mat4(1.0f);

    // Makes camera look in the right direction from the right position
    view = glm::lookAt(Position, Position + Orientation, Up);
    // Adds perspective to the scene
    projection = glm::perspective(glm::radians(verticalFOV), (float)width / height, nearClip, farClip);

    // Sets new camera matrix
    cameraMatrix = projection * view;
}

void Camera::Matrix(Shader& shader, const char* uniform)
{
    // Exports camera matrix
    glUniformMatrix4fv(glGetUniformLocation(shader.ID, uniform), 1, GL_FALSE, glm::value_ptr(cameraMatrix));
}

void Camera::setSpeed(float newSpeed)
{
    speed = newSpeed;
}

void Camera::Inputs(GLFWwindow* window, double deltaTime)
{
    float scalingFactor = 100.0f;
    // Determine the base speed
    float baseSpeed = speed * deltaTime;

    // Apply speed multiplier based on whether the left shift key is pressed
    float adjustedSpeed = (glfwGetKey(window, GLFW_KEY_LEFT_SHIFT) == GLFW_PRESS) ? baseSpeed * 2.0f : baseSpeed;

    static bool speedMultiplied = false;

    if (glfwGetKey(window, GLFW_KEY_W) == GLFW_PRESS)
    {
        Position += adjustedSpeed * Orientation;
    }
    if (glfwGetKey(window, GLFW_KEY_A) == GLFW_PRESS)
    {
        Position += adjustedSpeed * -glm::normalize(glm::cross(Orientation, Up));
    }
    if (glfwGetKey(window, GLFW_KEY_S) == GLFW_PRESS)
    {
        Position += adjustedSpeed * -Orientation;
    }
    if (glfwGetKey(window, GLFW_KEY_D) == GLFW_PRESS)
    {
        Position += adjustedSpeed * glm::normalize(glm::cross(Orientation, Up));
    }
    if (glfwGetKey(window, GLFW_KEY_SPACE) == GLFW_PRESS)
    {
        Position -= adjustedSpeed * -Up;
    }
    if (glfwGetKey(window, GLFW_KEY_LEFT_CONTROL) == GLFW_PRESS)
    {
        Position -= adjustedSpeed * Up;
    }

    bool shiftPressed = glfwGetKey(window, GLFW_KEY_LEFT_SHIFT) == GLFW_PRESS;
    if (shiftPressed && !speedMultiplied)
    {
        // Double the speed if left shift is pressed and speed has not been multiplied yet
        adjustedSpeed *= 2.0f;
        // Set flag to indicate that speed has been multiplied
        speedMultiplied = true;
    }
    else if (!shiftPressed && speedMultiplied)
    {
        // Reset the flag when shift key is released
        speedMultiplied = false;
    }

    if (glfwGetMouseButton(window, GLFW_MOUSE_BUTTON_RIGHT) == GLFW_PRESS)
    {
        glfwSetInputMode(window, GLFW_CURSOR, GLFW_CURSOR_DISABLED);

        if (firstClick)
        {
            glfwSetCursorPos(window, (width / 2), (height / 2));
            firstClick = false;
        }

        // Fetch the coordinates of the cursor
        double mouseX, mouseY;
        glfwGetCursorPos(window, &mouseX, &mouseY);

        // Calculate change in mouse position
        double deltaX = (width / 2) - mouseX;
        double deltaY = (height / 2) - mouseY;

        // Scale mouse movement by sensitivity and delta time
        deltaX *= sensitivity * scalingFactor * deltaTime;
        deltaY *= sensitivity * scalingFactor * deltaTime;

        // Update camera orientation
        float rotX = static_cast<float>(-deltaY) / height;
        float rotY = static_cast<float>(-deltaX) / width;

        // Update the camera orientation based on mouse movement
        // Update the camera orientation based on mouse movement
        glm::vec3 newOrientation = glm::rotate(Orientation, glm::radians(-rotX), glm::normalize(glm::cross(Orientation, Up)));

        // Check if the new orientation is within acceptable bounds (not looking directly up or down)
        if (!(glm::angle(newOrientation, Up) <= glm::radians(5.0f)) && !(glm::angle(newOrientation, -Up) <= glm::radians(5.0f)))
        {
            Orientation = newOrientation;
        }

        // Rotate around the global Up axis (Y-axis) instead of the local Up axis
        Orientation = glm::rotate(Orientation, glm::radians(-rotY), glm::vec3(0.0f, 1.0f, 0.0f));


        // Set the cursor position to the center of the window
        glfwSetCursorPos(window, (width / 2), (height / 2));
    }

    else
    {
        glfwSetInputMode(window, GLFW_CURSOR, GLFW_CURSOR_NORMAL);
        firstClick = true;
    }
}
