#version 330 core
out vec4 FragColor;

uniform vec3 camPos;
uniform vec3 camDir;
uniform vec3 camUp;
uniform float fov; // Field of view in degrees
uniform float aspectRatio;

const float pi = 3.14159265359;

struct Ray {
    vec3 origin;
    vec3 direction;
};

struct HitRecord {
    vec3 hitPoint;
    vec3 normal;
    float t;
    bool hit;
};

struct Sphere {
    vec3 center;
    float radius;
};

struct Hittable {
    Sphere sphere;
};

struct HittableList {
    Hittable hittables[2]; // Change the size according to the number of hittable objects
    int size;
};

struct Interval {
    float min;
    float max;
};

bool contains(Interval interval, float x) {
    return interval.min <= x && x <= interval.max;
}

bool intersects(Interval interval1, Interval interval2) {
    return interval1.min <= interval2.max && interval2.min <= interval1.max;
}

float degreesToRadians(float degrees) {
       return degrees * pi / 180.0;
}

float random_float() {
    // Use a simple pseudo-random number generator
    return fract(sin(gl_FragCoord.x * 12.9898 + gl_FragCoord.y * 78.233) * 43758.5453);
}

// Function to normalize a vector
vec3 unit_vector(vec3 v) {
    return normalize(v);
}

// Function to calculate ray direction from camera through pixel
vec3 getRayDirection(vec2 uv, vec3 camPos, vec3 camDir, vec3 camUp, float fov, float aspectRatio) {
    vec3 w = normalize(camDir);
    vec3 u = normalize(cross(camUp, w));
    vec3 v = cross(w, u);
    
    float tanFov = tan(radians(fov / 2.0));
    uv = uv * 2.0 - 1.0;
    uv.x *= aspectRatio * tanFov;
    uv.y *= tanFov;
    
    return normalize(u * uv.x + v * uv.y + w);
}

// Function to test intersection with a sphere
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

// Function to compute intersection with hittable objects
bool hit(HittableList list, Ray r, out HitRecord rec) {
    HitRecord tempRec;
    bool hitAnything = false;
    float closestSoFar = 100000.0; // Some large value
    
    for (int i = 0; i < list.size; ++i) {
        if (intersectSphere(r.origin, r.direction, list.hittables[i].sphere, tempRec.t)) {
            if (tempRec.t < closestSoFar) {
                hitAnything = true;
                closestSoFar = tempRec.t;
                tempRec.hitPoint = r.origin + tempRec.t * r.direction;
                tempRec.normal = unit_vector(tempRec.hitPoint - list.hittables[i].sphere.center);
                tempRec.hit = true;
            }
        }
    }
    
    rec = tempRec;
    return hitAnything;
}

// Function to compute ray color
vec3 rayColor(Ray r, HittableList list, vec3 bgStartColor, vec3 bgEndColor) {
    HitRecord rec;
    if (hit(list, r, rec)) {
        vec3 outwardNormal = rec.normal;
        // Check if the normal is pointing away from the camera
        if (dot(r.direction, rec.normal) > 0.0) {
            outwardNormal = -rec.normal; // Flip the normal
        }
        return 0.5 * (outwardNormal + vec3(1.0)); // Color based on normal
    }
    
    vec3 unit_direction = unit_vector(r.direction);
    float mixFactor = 0.5 * (unit_direction.y + 1.0);
    return mix(bgStartColor, bgEndColor, mixFactor); // Background gradient
}


void main() {
    Sphere sphere1 = Sphere(vec3(0.0, 0.0, -1.0), 0.5);
    Sphere sphere2 = Sphere(vec3(0.0, -100.5, -1.0), 100.0);
    HittableList list;
    list.hittables[0] = Hittable(sphere1);
    list.hittables[1] = Hittable(sphere2);
    list.size = 2;

    Ray r;
    r.origin = camPos;
    r.direction = getRayDirection(gl_FragCoord.xy / vec2(800.0, 600.0), camPos, camDir, camUp, fov, aspectRatio);

    vec3 bgStartColor = vec3(1.0, 1.0, 1.0); // White
    vec3 bgEndColor = vec3(0.5, 0.7, 1.0); // Light blue
    
    FragColor = vec4(rayColor(r, list, bgStartColor, bgEndColor), 1.0);
}
