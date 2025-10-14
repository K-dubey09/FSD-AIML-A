
function renderCards(containerOrSelector, initialData = [], options = {}) {
   
    const container =
        typeof containerOrSelector === 'string'
            ? document.querySelector(containerOrSelector)
            : containerOrSelector;
    if (!container) throw new Error('Container element not found');

   
    const {
        cardClass = 'card',
        onRenderCard = null,
        onClick = null,
        onDelete = null,
        onEdit = null,
    } = options;

    let data = Array.isArray(initialData) ? initialData.slice() : [];

    
    function createCard(item, index) {
        const card = document.createElement('div');
        card.className = cardClass;
        card.dataset.index = index;

        
        if (item.img) {
            const img = document.createElement('img');
            img.src = item.img;
            img.alt = item.title || 'card image';
            img.className = 'card-img';
            card.appendChild(img);
        }

        
        const title = document.createElement('h3');
        title.textContent = item.title || 'Untitled';
        title.className = 'card-title';
        card.appendChild(title);

        
        if (item.description) {
            const desc = document.createElement('p');
            desc.textContent = item.description;
            desc.className = 'card-desc';
            card.appendChild(desc);
        }

        
        const controls = document.createElement('div');
        controls.className = 'card-controls';

        const editBtn = document.createElement('button');
        editBtn.type = 'button';
        editBtn.textContent = 'Edit';
        editBtn.className = 'card-edit';
        editBtn.addEventListener('click', (e) => {
            e.stopPropagation();
           
            const newTitle = prompt('Edit title', item.title) ?? item.title;
            const newDesc = prompt('Edit description', item.description) ?? item.description;
            const newItem = Object.assign({}, item, { title: newTitle, description: newDesc });
            data[index] = newItem;
            if (typeof onEdit === 'function') onEdit(newItem, item, index);
            rerender();
        });

        const delBtn = document.createElement('button');
        delBtn.type = 'button';
        delBtn.textContent = 'Delete';
        delBtn.className = 'card-delete';
        delBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const removed = data.splice(index, 1)[0];
            if (typeof onDelete === 'function') onDelete(removed, index);
            rerender();
        });

        controls.appendChild(editBtn);
        controls.appendChild(delBtn);
        card.appendChild(controls);

       
        card.addEventListener('click', () => {
            if (typeof onClick === 'function') onClick(item, index);
        });

        if (typeof onRenderCard === 'function') onRenderCard(card, item, index);

        return card;
    }

  
    function rerender() {
        container.innerHTML = '';
        const frag = document.createDocumentFragment();
        data.forEach((item, i) => {
            frag.appendChild(createCard(item, i));
        });
        container.appendChild(frag);
    }

    
    function setData(newData) {
        data = Array.isArray(newData) ? newData.slice() : [];
        rerender();
    }

    function add(item) {
        data.push(item);
        rerender();
    }

    function update(index, newItem) {
        if (index < 0 || index >= data.length) return false;
        data[index] = newItem;
        rerender();
        return true;
    }

    function remove(index) {
        if (index < 0 || index >= data.length) return null;
        const removed = data.splice(index, 1)[0];
        rerender();
        return removed;
    }

    function getData() {
        return data.slice();
    }
    
    rerender();

    return { setData, add, update, remove, getData, rerender };
}

const __dummyCards = [
    { title: 'Portfolio Website', description: 'A personal portfolio built with vanilla JS components', img: '' },
    { title: 'Recipe App', description: 'A small recipe listing demo using JSON data', img: '' },
    { title: 'Blog Engine', description: 'Minimal blog frontend demo', img: '' },
    { title: 'Task Manager', description: 'A tiny task / todo UI demo', img: '' },
    { title: 'Chat UI', description: 'Prototype of a chat interface', img: '' },
    { title: 'Analytics Dashboard', description: 'Demo charts and KPI cards', img: '' }
];

if (typeof window !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        const ensureContainer = () => {
            let c = document.querySelector('#app');
            if (!c) {
                c = document.createElement('div');
                c.id = 'app';
                document.body.appendChild(c);
            }
            return c;
        };

        const appContainer = ensureContainer();

         const cardsDemo = renderCards(appContainer, __dummyCards, {
            cardClass: 'demo-card',
            onClick: (item) => console.log('Card clicked:', item),
            onDelete: (item) => console.log('Card deleted:', item),
            onEdit: (newItem, oldItem) => console.log('Card edited:', oldItem, '=>', newItem)
        });

        const controls = document.createElement('div');
        controls.style.cssText = 'position:fixed;right:16px;bottom:16px;display:flex;gap:8px;z-index:999;';

        const addBtn = document.createElement('button');
        addBtn.textContent = 'Add Sample';
        addBtn.addEventListener('click', () => {
            const idx = Math.floor(Math.random() * __dummyCards.length);
            const sample = Object.assign({}, __dummyCards[idx], { title: __dummyCards[idx].title + ' (copy)' });
            cardsDemo.add(sample);
        });

        const resetBtn = document.createElement('button');
        resetBtn.textContent = 'Reset';
        resetBtn.addEventListener('click', () => cardsDemo.setData(__dummyCards.slice()));

        controls.appendChild(addBtn);
        controls.appendChild(resetBtn);
        document.body.appendChild(controls);

        window.cardsDemo = cardsDemo;
    });
}