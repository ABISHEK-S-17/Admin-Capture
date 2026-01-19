import { Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Banner from "./pages/Banner";
import Login from "./pages/Login";
import Register from "./pages/Register";
import CreateBanner from "./pages/CreateBanner";
import EditBanner from "./pages/EditBanner";
import Category from "./pages/Category";
import CreateCategory from "./pages/CreateCategory";
import EditCategory from "./pages/EditCategory";
import Event from "./pages/Event";
import CreateEvent from "./pages/CreateEvent";
import EditEvent from "./pages/EditEvent";
import About from "./pages/About";
import CreateAbout from "./pages/CreateAbout";
import EditAbout from "./pages/EditAbout";
import Card from "./pages/Card";
import CreateCard from "./pages/CreateCard";
import EditCard from "./pages/EditCard";
import Portfolio from "./pages/Portfolio";
import CreatePortfolio from "./pages/CreatePortfolio";
import EditPortfolio from "./pages/EditPortfolio";
import Service from "./pages/Service";
import CreateService from "./pages/CreateService";
import EditService from "./pages/EditService";
import Price from "./pages/Price";
import CreatePrice from "./pages/CreatePrice";
import EditPrice from "./pages/EditPrice";
import Team from "./pages/Team";
import CreateTeam from "./pages/CreateTeam";
import EditTeam from "./pages/EditTeam";
import Process from "./pages/Process";
import CreateProcess from "./pages/CreateProcess";
import EditProcess from "./pages/EditProcess";
import Contact from "./pages/Contact";
import CreateContact from "./pages/CreateContact";
import EditContact from "./pages/EditContact";
import Blog from "./pages/Blog";
import CreateBlog from "./pages/CreateBlog";
import EditBlog from "./pages/EditBlog";
import Testimonial from "./pages/Testimonial";
import CreateTestimonial from "./pages/CreateTestimonial";
import EditTestimonial from "./pages/EditTestimonial";
import Logo from "./pages/Logo";
import CreateLogo from "./pages/CreateLogo";
import EditLogo from "./pages/EditLogo";

function App() {
  return (
    <>
      {/* 🔔 Toast Container (ONLY ONCE) */}
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        draggable
        theme="light"
      />

   <Routes>

  {/* 🌐 Public Routes */}
  <Route path="/login" element={<Login />} />
  <Route path="/register" element={<Register />} />

  {/* 🔒 Protected Routes */}
  <Route element={<ProtectedRoute />}>

    <Route path="/" element={<Home />} />

    {/* Banner */}
    <Route path="/banner" element={<Banner />} />
    <Route path="/create-banner" element={<CreateBanner />} />
    <Route path="/edit-banner/:id" element={<EditBanner />} />

    {/* Category */}
    <Route path="/category" element={<Category />} />
    <Route path="/create-category" element={<CreateCategory />} />
    <Route path="/edit-category/:id" element={<EditCategory />} />

    {/* Event */}
    <Route path="/event" element={<Event />} />
    <Route path="/create-event" element={<CreateEvent />} />
    <Route path="/edit-event/:id" element={<EditEvent />} />

    {/* About */}
    <Route path="/about" element={<About />} />
    <Route path="/create-about" element={<CreateAbout />} />
    <Route path="/edit-about/:id" element={<EditAbout />} />

    {/* Card */}
    <Route path="/card" element={<Card />} />
    <Route path="/create-card" element={<CreateCard />} />
    <Route path="/edit-card/:id" element={<EditCard />} />

    {/* Portfolio */}
    <Route path="/portfolio" element={<Portfolio />} />
    <Route path="/create-portfolio" element={<CreatePortfolio />} />
    <Route path="/edit-portfolio/:id" element={<EditPortfolio />} />

    {/* Service */}
    <Route path="/service" element={<Service />} />
    <Route path="/create-service" element={<CreateService />} />
    <Route path="/edit-service/:id" element={<EditService />} />

    {/* Price */}
    <Route path="/price" element={<Price />} />
    <Route path="/create-price" element={<CreatePrice />} />
    <Route path="/edit-price/:id" element={<EditPrice />} />

    {/* Team */}
    <Route path="/team" element={<Team />} />
    <Route path="/create-team" element={<CreateTeam />} />
    <Route path="/edit-team/:id" element={<EditTeam />} />

    {/* Process */}
    <Route path="/process" element={<Process />} />
    <Route path="/create-process" element={<CreateProcess />} />
    <Route path="/edit-process/:id" element={<EditProcess />} />

    {/* Contact */}
    <Route path="/contact" element={<Contact />} />
    <Route path="/create-contact" element={<CreateContact />} />
    <Route path="/edit-contact/:id" element={<EditContact />} />

    {/* Blog */}
    <Route path="/blog" element={<Blog />} />
    <Route path="/create-blog" element={<CreateBlog />} />
    <Route path="/edit-blog/:id" element={<EditBlog />} />

    {/* Testimonial */}
    <Route path="/testimonial" element={<Testimonial />} />
    <Route path="/create-testimonial" element={<CreateTestimonial />} />
    <Route path="/edit-testimonial/:id" element={<EditTestimonial />} />

     {/* Logo */}
    <Route path="/logo" element={<Logo />} />
    <Route path="/create-logo" element={<CreateLogo />} />
    <Route path="/edit-logo/:id" element={<EditLogo />} />

  </Route>
</Routes>


    </>
  );
}

export default App;
