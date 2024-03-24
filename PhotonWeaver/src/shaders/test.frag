#version 330 core
out vec4 FragColor;

in vec2 TexCoords;

uniform vec3 camPos;
uniform vec3 camDir;
uniform vec3 camUp;
uniform float fov; // Field of view in degrees
uniform float aspectRatio;
uniform vec3 sphereCenter;
uniform float sphereRadius;
uniform vec4 materialColor;

struct Ray {
    vec3 origin;
    vec3 direction;
};

struct Sphere {
    vec3 center;
    float radius;
};

vec3 unit_vector(vec3 v) {
    return normalize(v); // GLSL has a built-in normalize function
}

// Calculate the ray direction from camera through pixel
vec3 getRayDirection(vec2 uv, vec3 camPos, vec3 camDir, vec3 camUp, float fov, float aspectRatio) {
    // Calculate the right and up vectors
    vec3 w = normalize(camDir);
    vec3 u = normalize(cross(camUp, w));
    vec3 v = cross(w, u);

    // Adjust for aspect ratio and field of view
    float tanFov = tan(radians(fov / 2.0));
    uv = uv * 2.0 - 1.0;
    uv.x *= aspectRatio * tanFov;
    uv.y *= tanFov;

    // Calculate the final ray direction
    vec3 rayDir = normalize(u * uv.x + v * uv.y + w);
    return rayDir;
}

// Test for intersection with a sphere
bool intersectSphere(vec3 ro, vec3 rd, Sphere sphere, out float t) {
    vec3 oc = ro - sphere.center;
    float a = dot(rd, rd);
    float b = 2.0 * dot(oc, rd);
    float c = dot(oc, oc) - sphere.radius * sphere.radius;
    float discriminant = b * b - 4 * a * c;

    if (discriminant > 0.0) {
        float discSqrt = sqrt(discriminant);
        float t0 = (-b - discSqrt) / (2.0 * a);
        float t1 = (-b + discSqrt) / (2.0 * a);
        if (t0 > 0.0 && t0 < t1) {
            t = t0;
            return true;
        } else if (t1 > 0.0) {
            t = t1;
            return true;
        }
    }
    return false;
}

//vec3 ray_color(vec3 rayDir) {
//    vec3 unit_direction = normalize(rayDir);
//    float t = 0.5 * (unit_direction.y + 1.0);
//    vec3 white = vec3(1.0, 1.0, 1.0);
//    vec3 sky_blue = vec3(0.5, 0.7, 1.0);
//    // Mix between white and sky blue based on the height of the ray direction
//    return mix(white, sky_blue, t);
//}

vec3 rayColor(Ray r, Sphere sphere, vec3 bgStartColor, vec3 bgEndColor) {
    float t;
    if (intersectSphere(r.origin, r.direction, sphere, t)) {
        vec3 hitPoint = r.origin + t * r.direction;
        vec3 normal = unit_vector(hitPoint - sphere.center);
        return 0.5 * (normal + vec3(1.0)); // Color based on normal
    }

    vec3 unit_direction = unit_vector(r.direction);
    float mixFactor = 0.5 * (unit_direction.y + 1.0);
    return mix(bgStartColor, bgEndColor, mixFactor); // Background gradient
}

void main() {
    Sphere sphere = Sphere(sphereCenter, sphereRadius);

    Ray r;
    r.origin = camPos;
    r.direction = getRayDirection(TexCoords, camPos, camDir, camUp, fov, aspectRatio);

    vec3 bgStartColor = vec3(1.0, 1.0, 1.0); // White
    vec3 bgEndColor = vec3(0.5, 0.7, 1.0); // Light blue
    
    FragColor = vec4(rayColor(r, sphere, bgStartColor, bgEndColor), 1.0);
}
