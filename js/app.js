function iniciarApp(){
    
    const selectCategorias = document.querySelector('#categorias');
    selectCategorias.addEventListener('change', seleccionarCategoria);
    
    const resultado = document.querySelector('#resultado');
    //Crear instancia de Modal
    const modal = new bootstrap.Modal('#modal', {});
    
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
    function seleccionarCategoria(e){
        const categoria = e.target.value;
        const url = `https://www.themealdb.com/api/json/v1/1/filter.php?c=${categoria}`;

        fetch(url)
            .then(respuesta => respuesta.json())
            .then(resultado => mostrarRecetas(resultado.meals));

    }

    function mostrarRecetas( recetas = []){

        limpiarHTML(resultado);

        // Encabezado si se encuentran resultados
        const heading = document.createElement('h2');
        heading.classList.add('text-center', 'text-black', 'my-5', 'py-2', 'border-bottom');
        heading.textContent = recetas.length ? 'Resultados' : 'No hay resultados';
        resultado.appendChild(heading);



        // Iterar en los resultados
        recetas.forEach(receta => {
            const { idMeal, strMeal, strMealThumb } = receta;

            const recetaContenedor = document.createElement('div');
            recetaContenedor.classList.add('col-md-4');
            // recetaContenedor.textContent = receta.strMeal;

            const recetaCard = document.createElement('div');
            recetaCard.classList.add('card', 'mb-4');

            const recetaImagen = document.createElement('img');
            recetaImagen.classList.add('card-img-top');
            recetaImagen.alt = `Imagen de la receta ${strMeal}`;
            recetaImagen.src = strMealThumb;

            const recetaCardBody = document.createElement('div');
            recetaCardBody.classList.add('card-body');
            
            const recetaHeading = document.createElement('h3');
            recetaHeading.classList.add('card-title', 'mb-3', 'text-center');
            recetaHeading.textContent = strMeal;

            const recetaButton = document.createElement('button');
            recetaButton.classList.add('btn', 'btn-danger', 'w-100');
            recetaButton.textContent = 'Ver receta';
            // recetaButton.dataset.bsTarget = "#modal";
            // recetaButton.dataset.bsToggle = "modal";
            // Se utiliza onclick porque el elemento no existe en el HTML cuando JS se ejecute
            // Un addEventListener no funcionaría
            recetaButton.onclick = function() {
                seleccionarReceta(idMeal);
            }



            // Inyectar en el HTML
            recetaCardBody.appendChild(recetaHeading);
            recetaCardBody.appendChild(recetaButton);

            recetaCard.appendChild(recetaImagen);
            recetaCard.appendChild(recetaCardBody);

            recetaContenedor.appendChild(recetaCard);

            resultado.appendChild(recetaContenedor);
            
            
            // console.log(recetaImagen);
        })
    }

    function seleccionarReceta(id){
        const url = `https://themealdb.com/api/json/v1/1/lookup.php?i=${id}`;
        fetch(url)
            .then(respuesta => respuesta.json())
            .then(resultado => mostrarRecetaModal(resultado.meals[0]))
    }

    function mostrarRecetaModal(receta) {

        const { idMeal, strInstructions, strMeal, strMealThumb } = receta;

        // Añadir contenido al modal
        const modalTitle = document.querySelector('.modal .modal-title');
        const modalBody = document.querySelector('.modal .modal-body');

        modalTitle.textContent = strMeal;
        modalBody.innerHTML = `
            <img class="img-fluid" src="${strMealThumb}" alt="receta ${strMeal}" />
            <h3 class="my-3">Instrucciones</h3>
            <p>${strInstructions}</p>
            <h3 class="my-3">Ingredientes y cantidades</h3>
        `;

        const listGroup = document.createElement('ul')
        listGroup.classList.add('list-group');

        // Mostrar cantidades e ingredientes
        for (let i = 1; i <= 20 ; i++) {
            if(receta[`strIngredient${i}`]){
                const ingrediente = receta[`strIngredient${i}`];
                const cantidad = receta[`strMeasure${i}`];
                
                const ingredienteLi = document.createElement('LI');
                ingredienteLi.classList.add('list-group-item');
                ingredienteLi.textContent = `${ingrediente} - ${cantidad}`;
                
                listGroup.appendChild(ingredienteLi);
            }
        }

        modalBody.appendChild(listGroup);

        const modalFooter = document.querySelector('.modal-footer');
        limpiarHTML(modalFooter);

        // Botones de cerrar y favorito
        const btnFavorito = document.createElement('button');
        btnFavorito.classList.add('btn', 'btn-danger', 'col');
        btnFavorito.textContent = existeStorage(idMeal) ? 'Eliminar Favorito' : 'Guardar Favorito';

        // Almacenar en LocalStorage 
        btnFavorito.onclick = function() {

            if (existeStorage(idMeal)){
                eliminarFavorito(idMeal);
                btnFavorito.textContent = 'Guardar Favorito';
                mostrarToast('Eliminado Correctamente');
                return
            }
            // Se envia un objeto porque se requiere determinada informacion
            // para almacenarla en LocalStorage
            agregarFavorito({
                id: idMeal,
                titulo: strMeal,
                img: strMealThumb
            });
            btnFavorito.textContent = 'Eliminar Favorito';
            mostrarToast('Agregado Correctamente');
        }

        const btnCerrarModal = document.createElement('button');
        btnCerrarModal.classList.add('btn', 'btn-secondary', 'col');
        btnCerrarModal.textContent = 'Cerrar';
        btnCerrarModal.onclick = function() {
            modal.hide();
        }

        modalFooter.appendChild(btnFavorito);
        modalFooter.appendChild(btnCerrarModal);

        // Muestra el modal
        modal.show();
        
    }
    function agregarFavorito(receta) {
        // Nullish coleascing '??' , si la expresion izquierda es null o indefined,
        // se realiza la accion de la derecha
        const favoritos = JSON.parse(localStorage.getItem('favoritos')) ?? [];
        localStorage.setItem('favoritos', JSON.stringify([...favoritos, receta]));
    }

    function eliminarFavorito(id){
        const favoritos = JSON.parse(localStorage.getItem('favoritos')) ?? [];
        const nuevosFavoritos = favoritos.filter(favorito => favorito.id !== id);
        localStorage.setItem('favoritos', JSON.stringify(nuevosFavoritos));
    }

    function existeStorage(id){
        const favoritos = JSON.parse(localStorage.getItem('favoritos')) ?? [];
        return favoritos.some(favorito => favorito.id === id);    
    }

    function mostrarToast(mensaje){
        const toastDiv = document.querySelector('#toast');
        const toastBody = document.querySelector('.toast-body');
        // Se le debe pasar el div a donde se quiere agregar el toast
        const toast = new bootstrap.Toast(toastDiv);
        toastBody.textContent = mensaje;
        toast.show();
    }

    function limpiarHTML(selector) {
        while( selector.firstChild) {
            selector.removeChild(selector.firstChild);
        }
    }
}

document.addEventListener('DOMContentLoaded', iniciarApp);

