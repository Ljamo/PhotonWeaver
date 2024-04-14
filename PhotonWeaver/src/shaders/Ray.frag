#version 330 core

out vec4 FragColor;

uniform float width;
uniform float height;
uniform vec3 camPos;
uniform vec3 camDir;
uniform vec3 camUp;
uniform float fov;
uniform float aspectRatio;

vec3 rayOrigin = camPos;

vec3 getRayDirection(vec2 uv, vec3 camPos, vec3 camDir, vec3 camUp, float fov, float aspectRatio) {
    vec3 w = normalize(camDir);
    vec3 u = normalize(cross(camUp, w));
    vec3 v = cross(w, u);

    float tanFov = tan(radians(fov / 2.0));
    uv = uv * 2.0 - 1.0;
    uv.x *= aspectRatio * tanFov;
    uv.y *= tanFov;

    // Flip the u and v vectors to reverse mouse rotation
    return normalize(-u * uv.x + v * uv.y + w);
}

//rayDirection = getRayDirection(gl_FragCoord.xy / vec2(width, height), camPos, camDir, camUp, fov, aspectRatio);

void main() {
    vec2 coord = vec2(gl_FragCoord.x / width * 2.0 - 1.0, gl_FragCoord.y / height * 2.0 - 1.0);
    vec3 rayDirection = getRayDirection(gl_FragCoord.xy / vec2(width, height), camPos, camDir, camUp, fov, aspectRatio);
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
