import { HashRouter, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { CartProvider } from './context/CartContext';
import { ToastProvider } from './context/ToastContext';
import { Store } from './pages/Store';
import { Admin } from './pages/Admin';
import { ProductDetail } from './pages/ProductDetail';

function App() {
  return (
    <HashRouter>
      <LanguageProvider>
        <ToastProvider>
          <CartProvider>
            <Routes>
              <Route path="/" element={<Store />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="*" element={<Store />} />
            </Routes>
          </CartProvider>
        </ToastProvider>
      </LanguageProvider>
    </HashRouter>
  );
}

export default App;
