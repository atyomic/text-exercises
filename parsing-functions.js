function getProductArticles() {
  const articles = [];
  
  try {
    // Находим все карточки товаров на странице
    // Обычно карточки товаров имеют определенный класс или структуру
    const productCards = document.querySelectorAll('.product-card, .product-item, [data-product-id]');
    
    // Если не нашли карточки по стандартным классам, пробуем найти по другим признакам
    if (productCards.length === 0) {
      // Альтернативный поиск по структуре DOM
      const possibleCards = document.querySelectorAll('article, .catalog-item, .item, [itemtype*="Product"]');
      
      // Перебираем возможные карточки и ищем в них артикулы
      possibleCards.forEach(card => {
        // Ищем элемент с артикулом внутри карточки
        // Артикул может быть в атрибуте data-article, data-sku или в тексте элемента
        const articleElement = card.querySelector('[data-article], [data-sku], .article, .sku');
        
        if (articleElement) {
          const article = articleElement.getAttribute('data-article') || 
                          articleElement.getAttribute('data-sku') || 
                          articleElement.textContent.trim();
          
          if (article) {
            articles.push(article);
          }
        } else {
          // Если не нашли специальный элемент, ищем текст, похожий на артикул
          const cardText = card.textContent;
          const articleMatch = cardText.match(/артикул[:\s]+([A-Za-z0-9-]+)/i) || 
                              cardText.match(/арт[\.:\s]+([A-Za-z0-9-]+)/i);
          
          if (articleMatch && articleMatch[1]) {
            articles.push(articleMatch[1]);
          }
        }
      });
    } else {
      // Если нашли карточки по стандартным классам
      productCards.forEach(card => {
        // Пытаемся найти артикул в атрибутах
        const productId = card.getAttribute('data-product-id') || 
                          card.getAttribute('data-id') || 
                          card.getAttribute('id');
        
        if (productId) {
          articles.push(productId);
        } else {
          // Ищем элемент с артикулом внутри карточки
          const articleElement = card.querySelector('[data-article], [data-sku], .article, .sku');
          
          if (articleElement) {
            const article = articleElement.getAttribute('data-article') || 
                            articleElement.getAttribute('data-sku') || 
                            articleElement.textContent.trim();
            
            if (article) {
              articles.push(article);
            }
          } else {
            // Если не нашли специальный элемент, ищем текст, похожий на артикул
            const cardText = card.textContent;
            const articleMatch = cardText.match(/артикул[:\s]+([A-Za-z0-9-]+)/i) || 
                                cardText.match(/арт[\.:\s]+([A-Za-z0-9-]+)/i);
            
            if (articleMatch && articleMatch[1]) {
              articles.push(articleMatch[1]);
            }
          }
        }
      });
    }
    
    // Дополнительный метод: поиск по всему документу
    if (articles.length === 0) {
      // Ищем все элементы, которые могут содержать артикул
      const allElements = document.querySelectorAll('*');
      
      allElements.forEach(element => {
        const text = element.textContent;
        // Проверяем, содержит ли текст упоминание артикула
        if (text.includes('артикул') || text.includes('Артикул') || text.includes('арт.')) {
          const articleMatch = text.match(/артикул[:\s]+([A-Za-z0-9-]+)/i) || 
                              text.match(/арт[\.:\s]+([A-Za-z0-9-]+)/i);
          
          if (articleMatch && articleMatch[1]) {
            articles.push(articleMatch[1]);
          }
        }
      });
    }
    
    // Удаляем дубликаты
    return [...new Set(articles)];
  } catch (error) {
    console.error('Ошибка при получении артикулов:', error);
    return [];
  }
}

/**
 * Функция для получения характеристик товара на странице nir-vanna.ru
 * 
 * @returns {Object} Объект с характеристиками товара в формате attributeName: value
 */
function getProductAttributes() {
  const attributes = {};
  
  try {
    // Находим блок с характеристиками товара
    // Обычно характеристики находятся в таблице или списке с определенным классом
    const attributesBlock = document.querySelector('.product-attributes, .product-specs, .specifications, .characteristics, [data-tab="characteristics"]');
    
    if (attributesBlock) {
      // Если нашли блок с характеристиками, ищем в нем строки с атрибутами
      const attributeRows = attributesBlock.querySelectorAll('tr, .attribute-item, .spec-item, li');
      
      attributeRows.forEach(row => {
        // В каждой строке должно быть название атрибута и его значение
        const nameElement = row.querySelector('.attribute-name, .spec-name, .name, th, dt');
        const valueElement = row.querySelector('.attribute-value, .spec-value, .value, td, dd');
        
        if (nameElement && valueElement) {
          const name = nameElement.textContent.trim().replace(/[:\s]+$/, '');
          const value = valueElement.textContent.trim();
          
          if (name && value) {
            attributes[name] = value;
          }
        } else {
          // Если не нашли элементы с названием и значением, пробуем разделить текст строки
          const rowText = row.textContent.trim();
          const separatorIndex = rowText.indexOf(':');
          
          if (separatorIndex > 0) {
            const name = rowText.substring(0, separatorIndex).trim();
            const value = rowText.substring(separatorIndex + 1).trim();
            
            if (name && value) {
              attributes[name] = value;
            }
          }
        }
      });
    } else {
      // Если не нашли блок с характеристиками, ищем по всему документу
      // Ищем заголовок "Характеристики" или "Спецификации"
      const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      let attributesSection = null;
      
      for (const heading of headings) {
        const headingText = heading.textContent.toLowerCase();
        if (headingText.includes('характеристики') || headingText.includes('спецификации') || headingText.includes('параметры')) {
          attributesSection = heading.nextElementSibling;
          break;
        }
      }
      
      if (attributesSection) {
        // Ищем элементы с атрибутами в найденной секции
        const attributeItems = attributesSection.querySelectorAll('li, tr, .item');
        
        attributeItems.forEach(item => {
          const itemText = item.textContent.trim();
          const separatorIndex = itemText.indexOf(':');
          
          if (separatorIndex > 0) {
            const name = itemText.substring(0, separatorIndex).trim();
            const value = itemText.substring(separatorIndex + 1).trim();
            
            if (name && value) {
              attributes[name] = value;
            }
          }
        });
      }
      
      // Если все еще не нашли атрибуты, ищем по структуре DOM
      if (Object.keys(attributes).length === 0) {
        // Ищем все элементы, которые могут содержать пары ключ-значение
        const allElements = document.querySelectorAll('dl, table, .attributes, .specifications');
        
        allElements.forEach(element => {
          // Для dl элементов
          if (element.tagName === 'DL') {
            const dts = element.querySelectorAll('dt');
            
            dts.forEach(dt => {
              const name = dt.textContent.trim();
              const dd = dt.nextElementSibling;
              
              if (dd && dd.tagName === 'DD') {
                const value = dd.textContent.trim();
                
                if (name && value) {
                  attributes[name] = value;
                }
              }
            });
          }
          // Для таблиц
          else if (element.tagName === 'TABLE') {
            const rows = element.querySelectorAll('tr');
            
            rows.forEach(row => {
              const cells = row.querySelectorAll('td, th');
              
              if (cells.length >= 2) {
                const name = cells[0].textContent.trim();
                const value = cells[1].textContent.trim();
                
                if (name && value) {
                  attributes[name] = value;
                }
              }
            });
          }
          // Для других элементов
          else {
            const items = element.querySelectorAll('.item, li, .row');
            
            items.forEach(item => {
              const nameElement = item.querySelector('.name, .label, .key');
              const valueElement = item.querySelector('.value, .data');
              
              if (nameElement && valueElement) {
                const name = nameElement.textContent.trim();
                const value = valueElement.textContent.trim();
                
                if (name && value) {
                  attributes[name] = value;
                }
              }
            });
          }
        });
      }
    }
    
    return attributes;
  } catch (error) {
    console.error('Ошибка при получении характеристик товара:', error);
    return {};
  }
}

// Пример использования функций в консоли браузера:
// 
// 1. На странице https://groupprice.ru/categories/jenskaya-odejda:
// const articles = getProductArticles();
// console.log('Артикулы товаров:', articles);
// 
// 2. На странице https://nir-vanna.ru/product/smesitel-bravat-art-f175109c-dlya-rakoviny/:
// const attributes = getProductAttributes();
// console.log('Характеристики товара:', attributes);

