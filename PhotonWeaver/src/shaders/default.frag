#version 330 core
out vec4 FragColor; // Output color

// Define a ray struct
struct Ray {
    vec3 origin; // Ray origin
    vec3 direction; // Ray direction
};

// Define a sphere struct
struct Sphere {
    vec3 center; // Sphere center
    float radius; // Sphere radius
};

// Function to test for intersection with a sphere
bool intersectSphere(vec3 rayOrigin, vec3 rayDirection, Sphere sphere, out vec3 hitPosition, out vec3 hitNormal) {
    vec3 oc = rayOrigin - sphere.center;
    float a = dot(rayDirection, rayDirection);
    float b = 2.0 * dot(oc, rayDirection);
    float c = dot(oc, oc) - sphere.radius * sphere.radius;
    float discriminant = b * b - 4.0 * a * c;

    if (discriminant > 0.0) {
        float temp = (-b - sqrt(discriminant)) / (2.0 * a);
        if (temp > 0.001) {
            hitPosition = rayOrigin + rayDirection * temp;
            hitNormal = normalize(hitPosition - sphere.center);
            return true;
        }
    }
    return false;
}

// Function to shade the scene
vec3 shadeScene(Ray ray) {
    Sphere sphere;
    sphere.center = vec3(0.0, 0.0, -1.0);
    sphere.radius = 0.5;

    vec3 hitPosition;
    vec3 hitNormal;
    if (intersectSphere(ray.origin, ray.direction, sphere, hitPosition, hitNormal)) {
        vec3 unitDirection = normalize(ray.direction);
        float t = 0.5 * (unitDirection.y + 1.0);
        return (1.0 - t) * vec3(1.0) + t * vec3(0.5, 0.7, 1.0);
    }

    // Background color
    return vec3(0.5, 0.7, 1.0);
}

void main() {
    // Image
    float aspectRatio = 16.0 / 9.0;
    int imageWidth = 400;
    int imageHeight = int(float(imageWidth) / aspectRatio);

    // Camera
    vec3 cameraCenter = vec3(0.0);
    vec3 viewportU = vec3(2.0 * aspectRatio, 0.0, 0.0);
    vec3 viewportV = vec3(0.0, -2.0, 0.0);
    vec3 viewportUpperLeft = cameraCenter - vec3(0.0, 0.0, 1.0) - 0.5 * (viewportU + viewportV);

    // Render
    for (int j = 0; j < imageHeight; ++j) {
        for (int i = 0; i < imageWidth; ++i) {
            vec3 pixelCenter = viewportUpperLeft + float(i) / float(imageWidth) * viewportU
                             + float(j) / float(imageHeight) * viewportV;
            vec3 rayDirection = pixelCenter - cameraCenter;
            Ray ray;
            ray.origin = cameraCenter;
            ray.direction = rayDirection;

            vec3 pixelColor = shadeScene(ray);
            FragColor = vec4(pixelColor, 1.0);
        }
    }
}
