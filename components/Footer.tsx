"use client";

import { Leaf, Twitter, Github, Linkedin, Mail, Phone, MapPin } from "lucide-react";

const footerLinks = {
  Product: ["Features", "How It Works", "Analytics", "Pricing", "Changelog"],
  Resources: ["Documentation", "API Reference", "Case Studies", "Blog", "Status"],
  Company: ["About", "Careers", "Contact", "Privacy Policy", "Terms of Service"],
  Access: [
    { label: "User Sign In", href: "/signin" },
    { label: "Admin Sign In", href: "/admin/signin" },
    { label: "Staff Sign In", href: "/staff/signin" },
  ],
};

export default function Footer() {
  return (
    <footer id="contact" className="bg-slate-950 text-slate-400 pt-16 pb-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <a href="#" className="flex items-center gap-2.5 mb-5 group">
              <div className="w-9 h-9 bg-linear-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-900/50">
                <Leaf className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-bold text-white text-base">
                  Smart<span className="text-emerald-400">Campus</span>
                </span>
                <p className="text-xs text-slate-500 leading-none mt-0.5">Cleanliness Monitoring System</p>
              </div>
            </a>
            <p className="text-sm leading-relaxed mb-6 max-w-xs">
              Empowering campus administrators with intelligent, real-time
              cleanliness monitoring for healthier educational environments.
            </p>

            {/* Contact info */}
            <div className="flex flex-col gap-2.5 text-sm mb-6">
              <a href="mailto:hello@smartcampus.app" className="flex items-center gap-2.5 hover:text-emerald-400 transition-colors">
                <Mail className="w-4 h-4 text-emerald-600" />
                hello@smartcampus.app
              </a>
              <a href="tel:+911234567890" className="flex items-center gap-2.5 hover:text-emerald-400 transition-colors">
                <Phone className="w-4 h-4 text-emerald-600" />
                +91 123 456 7890
              </a>
              <span className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-emerald-600" />
                Bengaluru, India
              </span>
            </div>

            {/* Socials */}
            <div className="flex gap-3">
              {[Twitter, Github, Linkedin].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-9 h-9 bg-slate-800 hover:bg-emerald-600 rounded-lg flex items-center justify-center transition-colors duration-200"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-white font-semibold text-sm mb-4">{category}</h4>
              <ul className="flex flex-col gap-2.5">
                {links.map((link) => {
                  const isObject = typeof link === 'object';
                  const label = isObject ? link.label : link;
                  const href = isObject ? link.href : '#';
                  
                  return (
                    <li key={label}>
                      <a
                        href={href}
                        className="text-sm hover:text-emerald-400 transition-colors duration-150"
                      >
                        {label}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-slate-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-600">
            © 2024 SmartCampus Monitoring System. All rights reserved.
          </p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-xs text-slate-500">All systems operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
