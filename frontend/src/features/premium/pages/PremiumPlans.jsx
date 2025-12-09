import React from 'react';
import { motion } from 'framer-motion';
import { Check, Sparkles, Crown, Zap, Star, TrendingUp, Eye, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const PremiumPlans = () => {
  const navigate = useNavigate();

  const handleSubscribe = (planName, price) => {
    // Store subscription in localStorage
    const subscription = {
      plan: planName,
      price: price,
      subscribedAt: new Date().toISOString(),
      active: true
    };

    localStorage.setItem('userSubscription', JSON.stringify(subscription));
    toast.success(`Successfully subscribed to ${planName} plan!`);

    // Navigate back to credentials page
    setTimeout(() => {
      navigate('/credentials');
    }, 1500);
  };

  const plans = {
    go: {
      name: 'Go',
      price: '$0.99',
      period: '/month',
      icon: Sparkles,
      // Using teal gradient similar to learner theme
      color: 'from-[hsl(180,72%,24%)] to-[hsl(180,58%,31%)]',
      borderColor: 'border-[hsl(180,72%,24%)]',
      bgHover: 'hover:bg-[hsl(180,72%,24%)]/5',
      features: [
        {
          icon: Sparkles,
          title: 'Personalized AI Course Recommendations',
          description: 'Get smart course suggestions tailored to your goals',
          real: true
        },
        {
          icon: Award,
          title: 'Premium Badge',
          description: 'Visible to employers on your profile',
          real: true
        },
        {
          icon: TrendingUp,
          title: 'Priority Learning Insights',
          description: 'View your progress with enhanced analytics',
          real: false
        },
        {
          icon: Eye,
          title: 'Enhanced Profile Visibility',
          description: 'Stand out in searches and recommendations',
          real: false
        },
        {
          icon: Star,
          title: 'Weekly Motivation Prompts',
          description: 'Stay inspired with personalized messages',
          real: false
        }
      ]
    },
    plus: {
      name: 'Plus',
      price: '$1.99',
      period: '/month',
      icon: Crown,
      // Using employer/regulator teal-cyan gradient
      color: 'from-[hsl(186,57%,35%)] to-[hsl(179,45%,53%)]',
      borderColor: 'border-[hsl(186,57%,35%)]',
      bgHover: 'hover:bg-[hsl(186,57%,35%)]/5',
      popular: true,
      features: [
        {
          icon: Check,
          title: 'Everything in Go',
          description: 'All Go plan features included',
          real: true
        },
        {
          icon: Zap,
          title: 'Full AI Chatbot Access',
          description: 'Unlimited conversations with AI assistant',
          real: true
        },
        {
          icon: Crown,
          title: 'Employer Highlight Badge (Gold)',
          description: 'Premium gold badge on your profile',
          real: true
        },
        {
          icon: Sparkles,
          title: 'Advanced Profile Styling',
          description: 'Customize your profile with premium themes',
          real: false
        },
        {
          icon: TrendingUp,
          title: 'Priority Placement',
          description: 'Featured in explore and discovery sections',
          real: false
        },
        {
          icon: Star,
          title: 'Smart Learning Tips',
          description: 'Auto-generated insights to boost productivity',
          real: false
        },
        {
          icon: Award,
          title: 'Exclusive Premium Themes',
          description: 'Access to premium color schemes and layouts',
          real: false
        }
      ]
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 bg-background">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-[hsl(180,72%,24%)] to-[hsl(179,45%,53%)] bg-clip-text text-transparent">
            Upgrade Your Experience
          </h1>
          <p className="text-lg text-muted-foreground">
            Choose the perfect plan to accelerate your learning journey
          </p>
        </motion.div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Go Plan */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className={`relative bg-card rounded-2xl shadow-xl border-2 ${plans.go.borderColor} p-8 ${plans.go.bgHover} transition-all duration-300`}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className={`p-3 rounded-xl bg-gradient-to-br ${plans.go.color}`}>
                <plans.go.icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold">{plans.go.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold">{plans.go.price}</span>
                  <span className="text-gray-500">{plans.go.period}</span>
                </div>
              </div>
            </div>

            <ul className="space-y-4 mb-8">
              {plans.go.features.map((feature, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + index * 0.05 }}
                  className="flex gap-3"
                >
                  <div className={`flex-shrink-0 w-5 h-5 rounded-full ${feature.real ? 'bg-[hsl(152,68%,48%)]' : 'bg-[hsl(180,72%,24%)]'} flex items-center justify-center mt-0.5`}>
                    <Check className="w-3 h-3 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <feature.icon className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium text-foreground">
                        {feature.title}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {feature.description}
                    </p>
                  </div>
                </motion.li>
              ))}
            </ul>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSubscribe(plans.go.name, plans.go.price)}
              className={`w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r ${plans.go.color} hover:opacity-90 transition-opacity shadow-lg`}
            >
              Get Started
            </motion.button>
          </motion.div>

          {/* Plus Plan */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className={`relative bg-card rounded-2xl shadow-xl border-2 ${plans.plus.borderColor} p-8 ${plans.plus.bgHover} transition-all duration-300`}
          >
            {/* Popular Badge */}
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <span className="bg-gradient-to-r from-[hsl(186,57%,35%)] to-[hsl(179,45%,53%)] text-white px-4 py-1 rounded-full text-sm font-semibold shadow-lg">
                Most Popular
              </span>
            </div>

            <div className="flex items-center gap-3 mb-6 mt-2">
              <div className={`p-3 rounded-xl bg-gradient-to-br ${plans.plus.color}`}>
                <plans.plus.icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold">{plans.plus.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold">{plans.plus.price}</span>
                  <span className="text-gray-500">{plans.plus.period}</span>
                </div>
              </div>
            </div>

            <ul className="space-y-4 mb-8">
              {plans.plus.features.map((feature, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.05 }}
                  className="flex gap-3"
                >
                  <div className={`flex-shrink-0 w-5 h-5 rounded-full ${feature.real ? 'bg-[hsl(152,68%,48%)]' : 'bg-[hsl(186,57%,35%)]'} flex items-center justify-center mt-0.5`}>
                    <Check className="w-3 h-3 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <feature.icon className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium text-foreground">
                        {feature.title}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {feature.description}
                    </p>
                  </div>
                </motion.li>
              ))}
            </ul>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSubscribe(plans.plus.name, plans.plus.price)}
              className={`w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r ${plans.plus.color} hover:opacity-90 transition-opacity shadow-lg`}
            >
              Upgrade to Plus
            </motion.button>
          </motion.div>
        </div>

        {/* Footer Note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-12 text-sm text-muted-foreground"
        >
          <p>All plans include access to core platform features. Cancel anytime.</p>
        </motion.div>
      </div>
    </div>
  );
};

export default PremiumPlans;
