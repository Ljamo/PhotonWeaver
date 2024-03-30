#version 330 core

out vec4 FragOutput;

uniform float width;
uniform float height;

uniform vec3 camPos;
uniform vec3 camDir;

// Ray definitions-----------------------------------------------

struct point3
{
    float x;
    float y;
    float z;
};

struct Color {
    vec3 rgb; // Combined RGB components
};

struct ray
{
    point3 orig;
    vec3 dir;
};

ray createRay(point3 origin, vec3 direction)
{
    ray r;
    r.orig = origin;
    r.dir = direction;
    return r;
}

point3 at(ray r, float t)
{
    return point3(r.orig.x + t * r.dir.x,
                  r.orig.y + t * r.dir.y,
                  r.orig.z + t * r.dir.z);
}

point3 vec3ToPoint3(vec3 vec) {
    return point3(vec.x, vec.y, vec.z);
}

// End Ray Def---------------------------------------------------

// Calculate aspect ratio dynamically based on width and height
float aspect_ratio = width / height;

// Background colors
const vec3 bottom_color = vec3(0.5, 0.7, 1.0);
const vec3 top_color = vec3(1.0, 1.0, 1.0);

// ------------------------------------------------------------

// Start Var Declarations--------------------------------------

vec3 camRot = camDir;  // Camera rotation
float focal_length = 2.0;
point3 camCenter = vec3ToPoint3(camPos);  // Camera center
vec3 world_color = vec3(0.7, 0.8, 1.0); // Top part before going to white


float posX = gl_FragCoord.x;
float posY = gl_FragCoord.y;

// ------------------------------------------------------------

// Spheres
// The sphere: x^2 + y^2 + z^2 = r^2
// Within sphere: x^2 + y^2 + z^2 < r^2
// Outside sphere: x^2 + y^2 + z^2 > r^2
// Move sphere: (x-c)^2 + (y-c)^2 + (z-c)^2 = r^2
// Converted to vectors: (P-C)(P-C) = (x-Cx)^2 + (y-Cy)^2 + (z-Cz)^2
// Vector Simplified: (P-C)(P-C) = r^2
// Plug in P(t) = A + tb: (P(t) - C) (P(t) - C) = r^2
// Rewritten: ((A + tb) - C) ((A + tb) - C) = r^2

float HitSphere(point3 center, float radius, ray r) 
{
    vec3 oc = vec3(r.orig.x - center.x, r.orig.y - center.y, r.orig.z - center.z);
    float a = dot(r.dir, r.dir);
    float half_b = dot(oc, r.dir);
    float c = dot(oc, oc) - radius * radius;
    float discriminant = half_b * half_b - a * c;

    if (discriminant < 0.0) {
        return -1.0;
    } else {
        return (-half_b - sqrt(discriminant)) / a;
    }
}


Color ray_color(ray r) {
    float t = HitSphere(point3(0, 0, -1), 0.5, r);
    if (t > 0.0) {
        vec3 intersectionPoint = vec3(r.orig.x + t * r.dir.x, r.orig.y + t * r.dir.y, r.orig.z + t * r.dir.z);
        vec3 N = normalize(intersectionPoint - vec3(0.0, 0.0, -1.0));
        N.y *= -1.0;
        return Color(vec3(0.5 * (N.x + 1.0), 0.5 * (N.y + 1.0), 0.5 * (N.z + 1.0)));
    } else {
        vec3 unit_direction = normalize(r.dir);
        float a = 0.5 * (unit_direction.y + 1.0);
        return Color((1.0 - a) * vec3(1.0) + a * vec3(0.5, 0.7, 1.0));
    }
}


//-------------------------------------------

void main()
{
    // Calculate Ray Direction from cam to pixel loc
    float normalizedScreenX = (gl_FragCoord.x / width) * 2.0 - 1.0;
    float normalizedScreenY = 1.0 - (gl_FragCoord.y / height) * 2.0;
    
    // Transform normalized screen coordinates to ray direction
    vec3 rayDirection = normalize(vec3(normalizedScreenX * aspect_ratio, normalizedScreenY, -focal_length));
    
    // Rotate ray direction to align with camera orientation
    vec3 right = normalize(cross(camDir, vec3(0.0, 1.0, 0.0))); // Calculate camera's right vector
    vec3 up = normalize(cross(right, camDir)); // Calculate camera's up vector
    mat3 camToWorld = mat3(right, up, -camDir); // Create rotation matrix to align camera direction with negative z-axis
    rayDirection = camToWorld * rayDirection;

    point3 rayOrigin = camCenter;
    ray primaryRay;

    primaryRay.orig = rayOrigin;
    primaryRay.dir = rayDirection;

    // Check if the ray intersects with the sphere
    if (HitSphere(point3(0,0,-1), 0.5, primaryRay) >= 0) {
        Color col = ray_color(primaryRay);
        FragOutput = vec4(col.rgb, 1.0);
    } else {
        // Background gradient
        float t = 0.5 * (primaryRay.dir.y + 1.0);
        float normalized_y = 1.0 - (gl_FragCoord.y / height);
        vec3 background_color = mix(bottom_color, top_color, normalized_y);
        vec3 final_color = mix(world_color, background_color, normalized_y);
        FragOutput = vec4(final_color, 1.0);
    }
}
