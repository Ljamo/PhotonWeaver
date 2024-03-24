#version 330 core
out vec4 FragColor;

in vec2 TexCoords;

uniform vec3 camPos; // Camera position
uniform vec3 camDir; // Camera direction
uniform vec3 camUp; // Camera up vector
uniform float fov; // Field of view
uniform float aspectRatio; // Aspect ratio of the viewport

// Simple sphere definition
struct Sphere {
    vec3 center;
    float radius;
};

// Simple material definition
struct Material {
    vec4 color;
};

// Function to calculate ray direction
vec3 getRayDirection(vec2 uv, vec3 camPos, vec3 camDir, vec3 camUp, float fov, float aspectRatio) {
    vec3 right = cross(camDir, camUp);
    vec3 up = cross(right, camDir);
    uv = uv * 2.0 - 1.0; // Transform from [0,1] to [-1,1]
    vec3 dir = normalize(camDir + uv.x * right * aspectRatio + uv.y * up);
    return dir;
}

// Ray-sphere intersection
bool intersectSphere(vec3 rayOrigin, vec3 rayDir, Sphere sphere, out float t) {
    vec3 toSphere = rayOrigin - sphere.center;
    float a = dot(rayDir, rayDir);
    float b = 2.0 * dot(toSphere, rayDir);
    float c = dot(toSphere, toSphere) - sphere.radius * sphere.radius;
    float discriminant = b*b - 4*a*c;
    if (discriminant < 0) {
        return false; // No intersection
    }
    t = (-b - sqrt(discriminant)) / (2.0 * a);
    return t >= 0; // Intersection at t
}

void main() {
    Sphere sphere = Sphere(vec3(0.0, 0.0, -5.0), 1.0); // Define a sphere
    Material material = Material(vec4(1.0, 0.0, 0.0, 1.0)); // Red color

    // Calculate ray direction
    vec3 rayDir = getRayDirection(TexCoords, camPos, camDir, camUp, fov, aspectRatio);

    float t; // Intersection distance
    if (intersectSphere(camPos, rayDir, sphere, t)) {
        FragColor = material.color; // Hit the sphere
    } else {
        FragColor = vec4(0.0, 0.0, 0.0, 1.0); // Missed, background color
    }
}
