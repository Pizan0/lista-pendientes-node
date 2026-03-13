document.addEventListener("DOMContentLoaded", () => { // espera que se cargue el DOM
    const input = document.getElementById("input-box"); // campo de texto de nueva tarea
    const pendientes = document.getElementById("pendientes"); // lista de pendientes
    const realizado = document.getElementById("realizadas"); // lista de completadas

    document.getElementById("btn-agregar").addEventListener("click", agregar); // btn agregar tarea
    document.getElementById("btn-mover").addEventListener("click", mover); // btn mover a completadas
    document.getElementById("btn-remover").addEventListener("click", remover); // boton borra realizadas

//Cargar mis archivos
    async function cargar() { // obtiene el estado guardado en el servidor
        const res = await fetch('/api/estado'); // peticion GET al servidor
        const data = await res.json(); // parsea JSON recibido
        pendientes.innerHTML = data.pendientes; // rellena pendientes
        realizado.innerHTML = data.realizadas; // rellena realizadas
    }

    async function agregar() {
        const texto = input.value.trim(); // obtiene texto y quita espacios
        if (!texto) { alert("Debes escribir algo"); return; } // valida no vacío

        const res = await fetch('/api/agregar', { // peticion POST al servidor
            method: 'POST', // metodo HTTP
            headers: { 'Content-Type': 'application/json' }, // tipo de contenido
            body: JSON.stringify({ nombre: texto }) // envia nombre
        });

        if (res.status === 400) { // si rechaza
            alert("El servidor rechazó la tarea: Ya existe o está vacía"); // error duplicado/vacio
        } else { // si acepta
            input.value = ""; // limpia input

            const li = document.createElement("li"); // crea elemento lista
            li.style.marginBottom = "8px"; // separacion

            li.innerHTML = `
                <label>
                    <input type="checkbox" style="margin-right:8px; cursor:pointer;"> <!-- casilla -->
                    <span>${texto}</span> <!-- texto tarea -->
                </label>
            `; // estructura HTML

            pendientes.appendChild(li); // agrega a la lista
            salvar(); // sincroniza con servidor
        }
    }

    async function mover() { // mueve tareas seleccionadas a completadas
        const seleccionadas = pendientes.querySelectorAll(".marcada"); // items marcados

        seleccionadas.forEach(li => { // por cada item
            li.classList.remove("marcada"); // quita marca visual
            li.style.textDecoration = "line-through"; // tacha texto
            li.style.color = "gray"; // color gris

            const checkbox = li.querySelector("input"); // obtiene checkbox
            checkbox.checked = false; // desmarca

            realizado.appendChild(li); // mueve a completadas
        });

        salvar(); // guarda estado
    }

    async function remover() { // borra tareas marcadas de realizadas
        realizado.querySelectorAll(".marcada").forEach(li => li.remove());
        salvar(); // guarda cambios
    }

    document.addEventListener("change", (e) => { // captura cambios en checkbox
        if (e.target.type === "checkbox") { // si es checkbox
            const li = e.target.closest("li"); // item contenedor

            if (e.target.checked) { // si se marcó
                li.classList.add("marcada"); // marca para mover/borrar
            } else { // si se desmarcó
                li.classList.remove("marcada"); // quita marca
            }

            salvar(); // cada cambio se guarda
        }
    });

    async function salvar() { // envía HTML actual al servidor
        await fetch('/api/guardar', { // POST a guardar
            method: 'POST', // metodo HTTP
            headers: { 'Content-Type': 'application/json' }, // tipo JSON
            body: JSON.stringify({ // cuerpo
                pendientes: pendientes.innerHTML, // contenido de la lista
                realizadas: realizado.innerHTML // contenido completadas
            })
        });
    }

    cargar(); // carga datos al iniciar
});