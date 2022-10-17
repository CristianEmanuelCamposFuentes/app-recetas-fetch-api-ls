function iniciarApp(){

    const selectCategorias = document.querySelector('#categorias');

    obtenerCategorias();

    function obtenerCategorias(){
        const url = 'https://www.themealdb.com/api/json/v1/1/categories.php';
        // Metodo GET por defecto solo necesita (url)
        fetch(url)
            .then(respuesta => respuesta.json())
            .then(resultado => mostrarCategorias(resultado.categories));
    }
    function mostrarCategorias(categorias = []){
        categorias.forEach(categoria => {
            // Desestructuracion de cada categoria
            const { strCategory } = categoria;


            const option = document.createElement('option');
            option.value = strCategory;
            option.textContent = strCategory;
            // Inyectar categorias en el HTML
            selectCategorias.appendChild(option);

        });
}
}

document.addEventListener('DOMContentLoaded', iniciarApp);

