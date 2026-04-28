const gallery = document.getElementById('gallery');
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const filterBtns = document.querySelectorAll('.filter-btn');

const categories = ['naturaleza', 'retratos', 'nocturnas', 'urbanas', 'atardeceres', 'amaneceres', 'macro'];
const repoOwner = 'programmer-professionnal';
const repoName = 'fotografia-nikon';
const branch = 'master';

let allImages = {};

async function fetchImagesFromGitHub(category) {
    const url = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/images/${category}?ref=${branch}`;
    try {
        const response = await fetch(url);
        if (!response.ok) return [];
        const files = await response.json();
        return files
            .filter(file => /\.(jpg|jpeg|png|webp)$/i.test(file.name))
            .map(file => ({
                file: file.name,
                title: file.name.replace(/\.[^/.]+$/, "").replace(/-/g, ' '),
                category: category
            }));
    } catch (error) {
        console.error(`Error fetching ${category}:`, error);
        return [];
    }
}

async function loadImages() {
    gallery.innerHTML = '<div class="empty-state"><p>Cargando fotos...</p></div>';
    
    const promises = categories.map(cat => fetchImagesFromGitHub(cat));
    const results = await Promise.all(promises);
    
    categories.forEach((cat, i) => {
        allImages[cat] = results[i];
    });
    
    displayImages('todas');
}

function displayImages(filter) {
    gallery.innerHTML = '';

    let imagesToShow = [];
    
    if (filter === 'todas') {
        Object.keys(allImages).forEach(cat => {
            imagesToShow = imagesToShow.concat(allImages[cat]);
        });
    } else if (allImages[filter]) {
        imagesToShow = allImages[filter];
    }

    if (imagesToShow.length === 0) {
        gallery.innerHTML = '<div class="empty-state"><p>No hay imágenes en esta categoría</p></div>';
        return;
    }

    imagesToShow.forEach(({ file, title, category }) => {
        const div = document.createElement('div');
        div.className = 'photo';
        div.dataset.category = category;
        
        const img = document.createElement('img');
        img.src = `https://raw.githubusercontent.com/${repoOwner}/${repoName}/${branch}/images/${category}/${encodeURIComponent(file)}`;
        img.alt = title || `Foto ${category}`;
        img.loading = 'lazy';
        
        img.onerror = () => div.remove();
        
        img.onclick = () => openLightbox(img.src, title);
        
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
