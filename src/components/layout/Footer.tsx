import Link from 'next/link';
import { Github } from 'lucide-react';

export default function Footer() {
    const currentYear = new Date().getFullYear();
    const authors = [
        { username: 'muhammadshoh01', name: 'Muhammad' },
        { username: 'yelantsevv', name: 'Yelantsev' },
        { username: 'hitman46923', name: 'Hitman' },
    ];

    return (
        <footer className="bg-gray-50 border-t border-gray-200 mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="flex flex-col items-center space-y-4 mb-6">
                    <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                        Created by
                    </h3>
                    <div className="flex flex-wrap justify-center gap-6">
                        {authors.map((author, index) => (
                            <Link
                                key={author.username}
                                href={`https://github.com/${author.username}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`flex items-center space-x-3 text-gray-600 hover:text-gray-900 transition-all duration-300 group author-card p-3 rounded-lg hover:bg-white hover:shadow-md`}
                                style={{ animationDelay: `${index * 0.1}s` }}
                            >
                                <div className="relative">
                                    <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center group-hover:bg-gray-900 transition-colors duration-200">
                                        <Github size={20} className="text-white" />
                                    </div>
                                </div>
                                <span className="text-sm font-medium group-hover:underline">
                                    {author.username}
                                </span>
                            </Link>
                        ))}
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 pt-6 border-t border-gray-200">
                    <div className="flex items-center text-sm text-gray-500">
                        <span>© {currentYear} REST Client Application</span>
                    </div>
                    <Link
                        href="https://rs.school/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors group"
                    >
                        <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-red-500 rounded-lg flex items-center justify-center text-white text-xs font-bold group-hover:scale-105 transition-transform duration-200">
                            RS
                        </div>
                        <span className="text-sm font-medium group-hover:underline">
                            Rolling Scopes School
                        </span>
                    </Link>
                </div>
            </div>
        </footer>
    );
}