#version 330 core
out vec4 FragColor;

uniform vec3 camPos;
uniform vec3 camDir;
uniform vec3 camUp;
uniform float fov; // Field of view in degrees
uniform float aspectRatio;

const int maxBounces = 5; // Define the maximum number of bounces


const float pi = 3.14159265359;
const int num_samples = 100; // Number of samples per pixel

struct Ray {
    vec3 origin;
    vec3 direction;
};

struct HitRecord {
    vec3 hitPoint;
    vec3 normal;
    float t;
    bool hit;
    vec3 materialColor; // Include material color here
};

struct Sphere {
    vec3 center;
    float radius;
    vec3 materialColor; // Material color of the sphere
};

struct Hittable {
    Sphere sphere;
};

struct HittableList {
    Hittable hittables[2]; // Change the size according to the number of hittable objects
    int size;
};

float random_float() {
    // Use a simple pseudo-random number generator
    return fract(sin(gl_FragCoord.x * 12.9898 + gl_FragCoord.y * 78.233) * 43758.5453);
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
                tempRec.normal = normalize(tempRec.hitPoint - list.hittables[i].sphere.center);
                tempRec.hit = true;
                tempRec.materialColor = list.hittables[i].sphere.materialColor; // Assign material color
            }
        }
    }
    
    rec = tempRec;
    return hitAnything;
}

vec3 random_unit_vector() {
    // Generate a random vector on the unit sphere
    while (true) {
        vec3 p = vec3(random_float(), random_float(), random_float()) * 2.0 - vec3(1.0);
        if (length(p) < 1.0)
            return normalize(p);
    }
}

vec3 random_on_hemisphere(const vec3 normal) {
    // Generate a random vector on the hemisphere with the given normal
    vec3 random_direction = random_unit_vector();
    if (dot(random_direction, normal) > 0.0) {
        return random_direction;
    } else {
        return -random_direction;
    }
}

vec3 rayColorSingleSample(Ray r, HittableList list, vec3 bgStartColor, vec3 bgEndColor) {
    vec3 accumulatedColor = vec3(0.0);

    // Perform a single bounce
    HitRecord rec;
    if (hit(list, r, rec)) {
        vec3 normal = normalize(rec.normal);
        vec3 reflectDir = reflect(r.direction, normal);
        Ray reflectedRay;
        reflectedRay.origin = rec.hitPoint + 0.001 * normal;
        reflectedRay.direction = reflectDir;

        // Simulate light bounces by casting a shadow ray in the reflected direction
        vec3 reflectedColor = rayColorSingleSample(reflectedRay, list, bgStartColor, bgEndColor);

        // Compute diffuse lighting
        float diffuse = max(dot(normal, vec3(0.0, 1.0, 0.0)), 0.0);

        // Compute final color as a combination of diffuse lighting and reflected color
        accumulatedColor = (diffuse * vec3(0.8) + reflectedColor) * rec.materialColor;
    } else {
        // If the ray misses any objects, return the background gradient color
        vec3 unitDirection = normalize(r.direction);
        float t = 0.5 * (unitDirection.y + 1.0);
        accumulatedColor = mix(bgStartColor, bgEndColor, t);
    }

    return accumulatedColor;
}


vec3 rayColorSingleSample(Ray r, HittableList list, vec3 bgStartColor, vec3 bgEndColor) {
    vec3 accumulatedColor = vec3(0.0);

    // Perform a single bounce
    HitRecord rec;
    if (hit(list, r, rec)) {
        vec3 normal = normalize(rec.normal);
        vec3 reflectDir = reflect(r.direction, normal);
        Ray reflectedRay;
        reflectedRay.origin = rec.hitPoint + 0.001 * normal;
        reflectedRay.direction = reflectDir;

        // Simulate light bounces by casting a shadow ray in random directions
        vec3 indirectLight = vec3(0.0);
        for (int i = 0; i < num_samples; ++i) {
            // Introduce roughness by perturbing the normal
            vec3 perturbedNormal = normalize(normal + random_on_hemisphere(normal) * roughness);
            // Calculate shadow direction
            vec3 shadowDir = perturbedNormal;
            Ray shadowRay;
            shadowRay.origin = rec.hitPoint;
            shadowRay.direction = shadowDir;

            // Check for shadow intersection
            HitRecord shadowRec;
            bool shadowHit = hit(list, shadowRay, shadowRec);

            // Calculate light attenuation based on energy loss
            float attenuation = exp(-length(rec.hitPoint - shadowRec.hitPoint) * energy_loss);

            // If not in shadow, accumulate indirect lighting
            if (!shadowHit || shadowRec.t > length(shadowDir)) {
                float cosTheta = max(dot(shadowDir, normal), 0.0);
                indirectLight += cosTheta * vec3(1.0) * attenuation; // Assuming white light
            }
        }
        indirectLight /= float(num_samples);

        // Compute final color as a combination of diffuse lighting and reflected color
        accumulatedColor = indirectLight * rec.materialColor;
    } else {
        // If the ray misses any objects, return the background gradient color
        vec3 unitDirection = normalize(r.direction);
        float t = 0.5 * (unitDirection.y + 1.0);
        accumulatedColor = mix(bgStartColor, bgEndColor, t);
    }

    return accumulatedColor;
}



void main() {
    Sphere sphere1 = Sphere(vec3(0.0, 0.0, -1.0), 0.5, vec3(0.3)); // Gray sphere
    Sphere sphere2 = Sphere(vec3(0.0, -100.5, -1.0), 100.0, vec3(0.3)); // Gray sphere
    HittableList list;
    list.hittables[0] = Hittable(sphere1);
    list.hittables[1] = Hittable(sphere2);
    list.size = 2;
   
    Ray r;
    r.origin = camPos;
    r.direction = getRayDirection(gl_FragCoord.xy / vec2(800.0, 600.0), camPos, camDir, camUp, fov, aspectRatio);
    
    vec3 bgStartColor = vec3(1.0, 1.0, 1.0); // White
    vec3 bgEndColor = vec3(0.5, 0.7, 1.0); // Light blue
    
    // Calculate ray color with light bounces
    vec3 color = rayColor(r, list, bgStartColor, bgEndColor);
    
    FragColor = vec4(color, 1.0);
}
