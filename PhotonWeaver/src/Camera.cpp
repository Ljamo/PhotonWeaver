#include "Camera.h"


Camera::Camera(int width, int height, glm::vec3 position)
{
    Camera::width = width;
    Camera::height = height;
    Position = position;
}

void Camera::updateMatrix(float FOVdeg, float nearPlane, float farPlane)
{
    // Initializes matrices since otherwise they will be the null matrix
    glm::mat4 view = glm::mat4(1.0f);
    glm::mat4 projection = glm::mat4(1.0f);

    // Makes camera look in the right direction from the right position
    view = glm::lookAt(Position, Position + Orientation, Up);
    // Adds perspective to the scene
    projection = glm::perspective(glm::radians(FOVdeg), (float)width / height, nearPlane, farPlane);

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
        Position -= adjustedSpeed * -glm::normalize(glm::cross(Orientation, Up));
    }
    if (glfwGetKey(window, GLFW_KEY_S) == GLFW_PRESS)
    {
        Position += adjustedSpeed * -Orientation;
    }
    if (glfwGetKey(window, GLFW_KEY_D) == GLFW_PRESS)
    {
        Position -= adjustedSpeed * glm::normalize(glm::cross(Orientation, Up));
    }
    if (glfwGetKey(window, GLFW_KEY_SPACE) == GLFW_PRESS)
    {
        Position += adjustedSpeed * Up;
    }
    if (glfwGetKey(window, GLFW_KEY_LEFT_CONTROL) == GLFW_PRESS)
    {
        Position += adjustedSpeed * -Up;
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

        double mouseX;
        double mouseY;
        glfwGetCursorPos(window, &mouseX, &mouseY);

        float rotX = sensitivity * (float)(mouseY - (height / 2)) / height;
        float rotY = -sensitivity * (float)(mouseX - (width / 2)) / width;

        glm::vec3 newOrientation = glm::rotate(Orientation, glm::radians(-rotX), glm::normalize(glm::cross(Orientation, Up)));

        if (!(glm::angle(newOrientation, Up) <= glm::radians(5.0f)) or (glm::angle(newOrientation, -Up) <= glm::radians(5.0f)))
        {
            Orientation = newOrientation;
        }

        Orientation = glm::rotate(Orientation, glm::radians(-rotY), Up);

        glfwSetCursorPos(window, (width / 2), (height / 2));
    }
    else
    {
        glfwSetInputMode(window, GLFW_CURSOR, GLFW_CURSOR_NORMAL);
        firstClick = true;
    }
}
