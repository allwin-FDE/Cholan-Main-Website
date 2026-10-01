import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";
import Motion from "./components/fx/Motion";
import Interactions from "./components/fx/Interactions";
import "./components/fx/fx.css";
import { CartProvider } from "./cart/CartContext";
import CartDrawer from "./cart/CartDrawer";

import Home from "./pages/Home";
import Story from "./pages/Story";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import About from "./pages/About";
import Blog from "./pages/Blog";
import Contact from "./pages/Contact";
import Policy from "./pages/Policy";
import Checkout from "./pages/Checkout";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      {/* The cart outlives page changes, so it wraps every route. */}
      <CartProvider>
        <Routes>
          {/*
            The scroll film runs outside the shared shell. It is a full-bleed
            cinematic sequence with its own closing signature in chapter 10,
            so the sticky header would sit across every pinned frame and the
            site footer would repeat what chapter 10 already says.
          */}
          <Route path="/story" element={<Story />} />
          <Route path="*" element={<Shell />} />
        </Routes>
      </CartProvider>
    </BrowserRouter>
  );
}

function Shell() {
  return (
    <div className="app-shell">
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/about" element={<About />} />
          {/* The process page is gone; old links land on About instead. */}
          <Route path="/process" element={<Navigate to="/about" replace />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/policies/:slug" element={<Policy />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
      <CartDrawer />
      {/* Site-wide motion and play; after the page so its effects run once
          the page's own have set up. */}
      <Motion />
      <Interactions />
    </div>
  );
}
