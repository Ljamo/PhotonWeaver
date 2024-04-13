#version 330 core

out vec4 FragColor;

uniform float width;
uniform float height;

vec3 rayOrigin = vec3(0.0, 0.0, 2.0);

void main() {
    vec2 coord = vec2(gl_FragCoord.x / width * 2.0 - 1.0, gl_FragCoord.y / height * 2.0 - 1.0);
    vec3 rayDirection = vec3(coord.x, coord.y, -1.0);
    float radius = 0.5;
    vec3 lightDir = normalize(vec3(-1.0, -1.0, -1.0));

    // For unit vector
    // rayDirection = glm::normalize(rayDirection);
    // 
    // (bx^2 by^2)t^2 + (2axbx + 2ayby)t + (ax^2 + ay^2 - r^2) = 0

    // In equation
    // a = ray origin
    // b = ray direction
    // r = radius
    // t = hit distance / scalar

    // Written in Quadratic formula way
    // (bx ^ 2 by ^ 2)t ^ 2		= a
    // (2axbx + 2ayby)t			= b
    // (ax^2 + ay^2 - r^2)		= c

    float a = dot(rayDirection, rayDirection);
    float b = 2.0 * dot(rayOrigin, rayDirection);
    float c = dot(rayOrigin, rayOrigin) - radius * radius;

    float discriminant = b * b - 4.0 * a * c;

    if (discriminant < 0.0) {
        FragColor = vec4(0.0, 0.0, 0.0, 1.0);
    }
    else {
        float t0 = (-b + sqrt(discriminant)) / (2.0 * a);
        float closestT = (-b - sqrt(discriminant)) / (2.0 * a);

        vec3 hitPoint = rayOrigin + rayDirection * closestT;
        vec3 normal = normalize(hitPoint);

        float light = max(dot(normal, -lightDir), 0.0);
        vec3 sphereColor = vec3(1.0 * light, 0.0 * light, 1.0 * light);
        //sphereColor = sphereColor * light;
        vec4 finalColor = vec4(sphereColor, 1.0);
        FragColor = finalColor;
    }
}
