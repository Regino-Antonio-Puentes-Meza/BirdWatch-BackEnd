/* const _messages = {
    DATABASE_CONNECTION_ERROR: "Error al conectar a la base de datos",
    DATABASE_CONNECTING: "Conectando a la base de datos",
    EMAIL_NOT_FOUND: "Correo electrónico incorrecto o no registrado",
    INCORRECT_PASSWORD: "Contraseña incorrecta",
    PASSWORD_RESET: "Contraseña restablecida exitosamente",
    PASSWORD_RESET_ERROR: "Error al restablecer la contraseña",
    LOGIN_SUCCESS: "Inicio de sesión exitoso",  
    BIRD_REGISTERED: "El ave ya está registrada",
    SPECIES_CREATED: "Especie de ave creada exitosamente",
    BIRD_NOT_FOUND: "Ave no encontrada",
    SPECIES_DELETED: "Especie de ave eliminada exitosamente",
    GET_BIRDS_ERROR: "Error al obtener aves",
    USER_NOT_FOUND: "Usuario no encontrado",
    USER_NOT_FOUND: "El usuario no existe",
    USER_DELETED: "Usuario eliminado exitosamente",
    USER_CREATED: "Usuario creado exitosamente",
    PASSWORD_RESET_LINK: "Se ha enviado un enlace de recuperación de contraseña a tu correo",
    PASSWORD_RECOVERY_ERROR: "Error al intentar recuperar la contraseña",
    INVALID_CREDENTIALS: "Correo electrónico o contraseña incorrectos",
    LOGIN_ERROR: "Error al iniciar sesión",
    INTERNAL_SERVER_ERROR: "Error interno del servidor",
    ///
    NEWS_CREATED: "Noticia creada con éxito",
    NEWS_DELETED: "Noticia eliminada con éxito",
    POST_DELETED: "Post deleted successfully",
    POST_UPDATED: "Post Updated",
    POST_CREATE_ERROR: "Error al crear el post",
    POST_NOT_FOUND: "Publicación no encontrada",
    POST_GET_ERROR: "Error al obtener el post",
    POST_UPDATE_ERROR: "Error al actualizar el post",
    POST_DELETE_ERROR: "Error al eliminar el post",
    RANDOM_POSTS_ERROR: "Error al obtener las publicaciones aleatorias",
    POSTS_FETCH_ERROR: "Error al obtener las publicaciones",
    LIKE_HANDLE_ERROR: "Error al manejar el like",
    TIMELINE_POSTS_ERROR: "Error al obtener la línea de tiempo de publicaciones",
    //
    EMAIL_ALREADY_REGISTERED: "El correo ya está registrado",
    USERNAME_ALREADY_REGISTERED: "El usuario ya está registrado",
    //
    TOKEN_EXPIRED: "El token ha expirado",
    ACCESS_DENIED_UPDATE_PROFILE: "Acceso denegado. Solo puedes actualizar tu propio perfil",
    ACTION_FORBIDDEN: "Acción prohibida",
    USER_ALREADY_FOLLOWED: "Ya sigues a este usuario",
    USER_FOLLOWED: "Usuario seguido!",

    //
    GET_DEPARTMENTS_ERROR: "Error al obtener los departamentos",
    DEPARTMENT_ALREADY_REGISTERED: "El departamento ya está registrado",
    DEPARTMENT_CREATED: "Departamento creado exitosamente",

    //
    INVALID_DEPARTMENT_ID: "Invalid department ID",
    GET_MUNICIPALITIES_ERROR: "Error al obtener los municipios",
    DEPARTMENT_NOT_FOUND: "El departamento no existe",
    MUNICIPALITIES_CREATED_SUCCESS: "Municipios creados exitosamente",
    CONNECTION_TIMEOUT_ERROR: "Error de conexión: Tiempo de espera agotado.",
    CHECK_IP_PUBLIC_ATLAS: "Por favor, verifique que su IP pública esté configurada en MongoDB Atlas para permitir la conexión a la base de datos.",
    DATA_RECEIVED_BACKEND: "Datos recibidos en backend:",
    IMAGE_URL_NOT_FOUND: "No se pudo obtener la URL de la imagen" ,//uploadRoutes.js
    IMAGE_UPLOAD: "Imagen subida correctamente",//uploadRoutes.js
    EMAIL_SEND_ERROR: "Error al enviar correo:" , //emailService.js




    
};
export {_messages as default} */


// src/utils/messages.js

// src/utils/messages.js

const _messages = {
    // GENERALES
    DATABASE: {
        DATABASE_CONNECTION_ERROR: "Error al conectar a la base de datos",
        DATABASE_CONNECTING: "Conectando a la base de datos",
        CONNECTION_TIMEOUT_ERROR: "Error de conexión: Tiempo de espera agotado.",
        CHECK_IP_PUBLIC_ATLAS: "Por favor, verifique que su IP pública esté configurada en MongoDB Atlas para permitir la conexión a la base de datos.",
        MONGODB_URI_UNDEFINED: "Por favor, define la variable de entorno MONGODB_URI",
    },
    SERVER: {
        INTERNAL_SERVER_ERROR: "Error interno del servidor",
        DATA_RECEIVED_BACKEND: "Datos recibidos en backend:",
    },
    EMAIL_SERVICE: {
        EMAIL_SEND_ERROR: "Error al enviar correo:",
    },

    // AUTENTICACIÓN Y AUTORIZACIÓN 
    AUTH: {
        EMAIL_NOT_FOUND: "Correo electrónico incorrecto o no registrado",
        INCORRECT_PASSWORD: "Contraseña incorrecta",
        LOGIN_SUCCESS: "Inicio de sesión exitoso",
        INVALID_CREDENTIALS: "Correo electrónico o contraseña incorrectos",
        LOGIN_ERROR: "Error al iniciar sesión",
        EMAIL_ALREADY_REGISTERED: "El correo ya está registrado",
        USERNAME_ALREADY_REGISTERED: "El usuario ya está registrado",
        TOKEN_EXPIRED: "El token ha expirado",

    },
    PASSWORD_RESET: {
        PASSWORD_RESET: "Contraseña restablecida exitosamente", 
        PASSWORD_RESET_ERROR: "Error al restablecer la contraseña",
        PASSWORD_RESET_LINK: "Se ha enviado un enlace de recuperación de contraseña a tu correo",
        PASSWORD_RECOVERY_ERROR: "Error al intentar recuperar la contraseña",
    },

    // userController.js
    USER: {
        USER_NOT_FOUND: "El usuario no existe", 
        USER_DELETED: "Usuario eliminado exitosamente",
        USER_CREATED: "Usuario creado exitosamente",
        ACCESS_DENIED_UPDATE_PROFILE: "Acceso denegado. Solo puedes actualizar tu propio perfil",
        ACTION_FORBIDDEN: "Acción prohibida", 
        USER_ALREADY_FOLLOWED: "Ya sigues a este usuario",
        USER_FOLLOWED: "Usuario seguido!",
        USER_UNFOLLOWED: "User Unfollowed!",
        USER_IS_NOT_FOLLOWED: "User is not followed by you",

    },

    // birdController.js
    BIRD: {
        BIRD_REGISTERED: "El ave ya está registrada",
        SPECIES_CREATED: "Especie de ave creada exitosamente",
        BIRD_NOT_FOUND: "Ave no encontrada",
        SPECIES_DELETED: "Especie de ave eliminada exitosamente",
        GET_BIRDS_ERROR: "Error al obtener aves",
    },

    // newsController.js
    NEWS: {
        NEWS_CREATED: "Noticia creada con éxito",
        NEWS_DELETED: "Noticia eliminada con éxito",
    },

    // postController.js
    POST: {
        POST_DELETED: "Post deleted successfully",
        POST_UPDATED: "Post Updated",
        POST_CREATE_ERROR: "Error al crear el post",
        POST_NOT_FOUND: "Publicación no encontrada",
        POST_GET_ERROR: "Error al obtener el post",
        POST_UPDATE_ERROR: "Error al actualizar el post",
        POST_DELETE_ERROR: "Error al eliminar el post",
        RANDOM_POSTS_ERROR: "Error al obtener las publicaciones aleatorias",
        POSTS_FETCH_ERROR: "Error al obtener las publicaciones", 
        LIKE_HANDLE_ERROR: "Error al manejar el like",
        TIMELINE_POSTS_ERROR: "Error al obtener la línea de tiempo de publicaciones",
    },

    // --- MÓDULO DE UBICACIONES ---
    LOCATION: {
        DEPARTMENT: {
            GET_DEPARTMENTS_ERROR: "Error al obtener los departamentos",
            DEPARTMENT_ALREADY_REGISTERED: "El departamento ya está registrado",
            DEPARTMENT_CREATED: "Departamento creado exitosamente",
            DEPARTMENT_NOT_FOUND: "El departamento no existe", 
        },
        MUNICIPALITY: {
            INVALID_DEPARTMENT_ID: "Invalid department ID",
            GET_MUNICIPALITIES_ERROR: "Error al obtener los municipios",
            MUNICIPALITIES_CREATED_SUCCESS: "Municipios creados exitosamente",
        }
    },

    // uploadRoutes.js
    UPLOAD: {
        IMAGE_URL_NOT_FOUND: "No se pudo obtener la URL de la imagen",
        IMAGE_UPLOAD: "Imagen subida correctamente", 
    }
};

export default _messages;