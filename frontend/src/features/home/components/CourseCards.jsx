import React from 'react';
import { Star, Clock, Award, BookOpen } from 'lucide-react';

const CourseCard = ({ course }) => {
  const handleClick = () => {
    if (course.url) {
      window.open(course.url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div
      onClick={handleClick}
      className="bg-white rounded-xl border border-gray-200 p-3 space-y-1.5 hover:shadow-lg hover:scale-[1.01] transition-all duration-300 cursor-pointer"
    >
      {/* Course Image */}
      <div className="relative w-full aspect-[16/9] rounded-lg overflow-hidden bg-gradient-to-br from-teal-50 to-green-50">
        <img
          src={course.image}
          alt={course.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = 'https://placehold.co/600x400/14b8a6/ffffff?text=Course+Image';
          }}
        />
        {/* Platform Badge */}
        <div className="absolute top-2 right-2">
          <span className="px-2 py-1 text-xs font-semibold rounded-md bg-white/90 backdrop-blur-sm text-gray-900 shadow-sm">
            {course.platform}
          </span>
        </div>
      </div>

      {/* Category & NSQF Level */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {course.category && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-md bg-teal-100 text-teal-700">
            <BookOpen className="h-3 w-3" />
            {course.category}
          </span>
        )}
        {course.nsqfLevel && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-md bg-blue-100 text-blue-700">
            <Award className="h-3 w-3" />
            NSQF {course.nsqfLevel}
          </span>
        )}
      </div>

      {/* Rating */}
      <div className="flex items-center gap-1.5 text-sm">
        <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
        <span className="font-semibold text-gray-900">{typeof course.rating === 'number' ? course.rating.toFixed(1) : course.rating}</span>
        <span className="text-gray-600">({typeof course.ratingsCount === 'number' ? course.ratingsCount.toLocaleString() : course.ratings_count})</span>
      </div>

      {/* Course Title */}
      <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug min-h-[2.5rem]">
        {course.title}
      </h3>

      {/* Instructor */}
      <p className="text-xs text-gray-600 line-clamp-1">
        {course.instructor}
      </p>

      {/* Duration & Difficulty */}
      <div className="flex items-center gap-2 text-xs text-gray-600">
        {course.duration && (
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {course.duration}h
          </span>
        )}
        {course.difficulty && (
          <span className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 font-medium">
            {course.difficulty}
          </span>
        )}
      </div>

      {/* Price Section */}
      <div className="flex items-center gap-2">
        <span className="text-lg font-bold text-gray-900">
          {course.price || 'Free'}
        </span>
        {course.original_price && course.original_price !== course.price && (
          <span className="text-xs text-gray-500 line-through">
            {course.original_price || course.originalPrice}
          </span>
        )}
      </div>
    </div>
  );
};

const CourseCards = ({ courses = [] }) => {
  // Default dummy data if no courses provided
  const defaultCourses = [
    {
      title: "The Product Management for AI & Data Science Course",
      instructor: "365 Careers, Danielle Thé",
      rating: 4.5,
      ratings_count: "9,159",
      badge: "Premium",
      price: "₹689",
      original_price: "₹3,699",
      image: "https://placehold.co/600x400/14b8a6/ffffff?text=AI+%26+Data+Science"
    },
    {
      title: "The Beginner's Guide to AI - Unity 6 Compatible",
      instructor: "Penny de Byl, Penny Holistic3D",
      rating: 4.5,
      ratings_count: "2,825",
      badge: "Bestseller",
      price: "₹679",
      original_price: "₹3,099",
      image: "https://placehold.co/600x400/14b8a6/ffffff?text=AI+Unity"
    },
    {
      title: "Introduction to AI and Machine Learning with Go (Golang)",
      instructor: "Trevor Sawler",
      rating: 4.9,
      ratings_count: "28",
      badge: "Bestseller",
      price: "₹549",
      original_price: "₹2,059",
      image: "https://placehold.co/600x400/14b8a6/ffffff?text=AI+%26+ML+Go"
    },
    {
      title: "Mastering Voice AI: From ASR to Emotion AI to Voice Cloning",
      instructor: "Vinit Singh",
      rating: 4.9,
      ratings_count: "135",
      badge: null,
      price: "₹549",
      original_price: "₹1,769",
      image: "https://placehold.co/600x400/14b8a6/ffffff?text=Voice+AI"
    }
  ];

  const displayCourses = courses.length > 0 ? courses : defaultCourses;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {displayCourses.map((course, index) => (
        <CourseCard key={course._id || course.id || index} course={course} />
      ))}
    </div>
  );
};

export default CourseCards;
