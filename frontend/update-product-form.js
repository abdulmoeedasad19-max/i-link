const fs = require('fs');
const file = 'src/components/admin/products/product-form.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add collections to props
content = content.replace(
  'brands: { id: string; name: string }[];',
  'brands: { id: string; name: string }[];\n  collections?: { id: string; name: string; categoryId: string }[];'
);
content = content.replace(
  '  brands,\n}: {',
  '  brands,\n  collections,\n}: {'
);

// 2. Add state for categoryId
content = content.replace(
  'const [description, setDescription] = useState(product?.description ?? "");',
  'const [description, setDescription] = useState(product?.description ?? "");\n  const [categoryId, setCategoryId] = useState(product?.categoryId ?? "");'
);

// 3. Make category select controlled
content = content.replace(
  'defaultValue={product?.categoryId ?? ""}',
  'value={categoryId}\n              onChange={(e) => setCategoryId(e.target.value)}'
);

// 4. Inject Collections UI
const collectionsUI = 
        {categoryId && collections && collections.some(c => c.categoryId === categoryId) && (
          <div className="mt-6 border-t border-light-gray pt-6">
            <h3 className="text-sm font-bold text-navy mb-3">Category Collections</h3>
            <div className="flex flex-col gap-2">
              {collections.filter(c => c.categoryId === categoryId).map(collection => (
                <label key={collection.id} className="flex items-center gap-2 text-sm text-slate">
                  <input
                    type="checkbox"
                    name="collectionIds"
                    value={collection.id}
                    defaultChecked={product?.collectionIds?.includes(collection.id)}
                    className="h-4 w-4 rounded border-light-gray text-royal focus:ring-royal/30"
                  />
                  {collection.name}
                </label>
              ))}
            </div>
          </div>
        )}
      </div>;
content = content.replace(
  '            </select>\n          </Field>\n        </div>\n      </div>',
  '            </select>\n          </Field>\n        </div>' + collectionsUI
);

fs.writeFileSync(file, content);
console.log('Done product-form.tsx');
