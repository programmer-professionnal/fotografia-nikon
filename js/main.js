const gallery = document.getElementById('gallery');
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const filterBtns = document.querySelectorAll('.filter-btn');

let allImages = {};

async function loadImages() {
    try {
        const response = await fetch('images.json');
        allImages = await response.json();
        displayImages('todas');
    } catch (error) {
        console.error('Error cargando imágenes:', error);
        gallery.innerHTML = '<div class="empty-state"><p>Error cargando images.json<br>Asegúrate de que el archivo existe</p></div>';
    }
}

function displayImages(filter) {
    gallery.innerHTML = '';

    let imagesToShow = [];
    
    if (filter === 'todas') {
        Object.keys(allImages).forEach(cat => {
            imagesToShow = imagesToShow.concat(
                allImages[cat].map(img => ({ ...img, category: cat }))
            );
        });
    } else if (allImages[filter]) {
        imagesToShow = allImages[filter].map(img => ({ ...img, category: filter }));
    }

    if (imagesToShow.length === 0) {
        gallery.innerHTML = '<div class="empty-state"><p>No hay imágenes en esta categoría</p></div>';
        return;
    }

    imagesToShow.forEach(({ file, title, description, category }) => {
        const div = document.createElement('div');
        div.className = 'photo';
        div.dataset.category = category;
        
        const img = document.createElement('img');
        img.src = `images/${category}/${file}`;
        img.alt = title || `Foto ${category}`;
        img.loading = 'lazy';
        
        img.onerror = () => div.remove();
        
        img.onclick = () => openLightbox(`images/${category}/${file}`, title);
        
        div.appendChild(img);
        gallery.appendChild(div);
    });
}

function openLightbox(src, title) {
    lightboxImg.src = src;
    document.getElementById('lightbox-caption').textContent = title || '';
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = 'auto';
}

lightbox.querySelector('.close').onclick = closeLightbox;
lightbox.onclick = (e) => {
    if (e.target === lightbox) closeLightbox();
};
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeLightbox();
});

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        displayImages(btn.dataset.filter);
    });
});

loadImages();
