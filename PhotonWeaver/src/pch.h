#include <glad/glad.h>
#include <GLFW/glfw3.h>
#include <glm.hpp>
#include <gtc/matrix_transform.hpp>
#include <gtc/type_ptr.hpp>
#include <gtx/rotate_vector.hpp>
#include <gtx/vector_angle.hpp>
#include <gtc/quaternion.hpp>
#include <gtx/quaternion.hpp>

#include <string>
#include <fstream>
#include <sstream>
#include <iostream>
#include <cerrno>
#include <filesystem>

#define parentDir (std::filesystem::current_path().std::filesystem::path::parent_path()).string()
