document.addEventListener("DOMContentLoaded", function() {
    // Función para alternar la visibilidad de la lista de encantamientos
    function toggleEnchantments(id, itemClass) {
      const list = document.getElementById(id);
      if (list) {
        list.classList.toggle('hidden');
        const itemImg = document.querySelector(itemClass);
        if (itemImg) {
          itemImg.classList.toggle('achicar');
        }
      }
    }
  
    // Añadir el evento a todos los botones de "Ver"
    const buttons = document.querySelectorAll('.rainbow-button');
    buttons.forEach(button => {
      button.addEventListener('click', function(event) {
        event.preventDefault();
        const targetId = this.getAttribute('data-target');
        const itemClass = this.getAttribute('data-item-class');
        toggleEnchantments(targetId, itemClass);
      });
    });
  });
