import { Marquee } from '../ui/marquee.jsx';
import { motion } from 'framer-motion';

const brandList = [
  {
    image: 'https://images.shadcnspace.com/assets/brand-logo/logoipsum-1.svg',
    lightimg:
      'https://images.shadcnspace.com/assets/brand-logo/logoipsum-light-1.svg',
    name: 'Brand 1',
  },
  {
    image: 'https://images.shadcnspace.com/assets/brand-logo/logoipsum-2.svg',
    lightimg:
      'https://images.shadcnspace.com/assets/brand-logo/logoipsum-light-2.svg',
    name: 'Brand 2',
  },
  {
    image: 'https://images.shadcnspace.com/assets/brand-logo/logoipsum-3.svg',
    lightimg:
      'https://images.shadcnspace.com/assets/brand-logo/logoipsum-light-3.svg',
    name: 'Brand 3',
  },
  {
    image: 'https://images.shadcnspace.com/assets/brand-logo/logoipsum-4.svg',
    lightimg:
      'https://images.shadcnspace.com/assets/brand-logo/logoipsum-light-4.svg',
    name: 'Brand 4',
  },
  {
    image: 'https://images.shadcnspace.com/assets/brand-logo/logoipsum-5.svg',
    lightimg:
      'https://images.shadcnspace.com/assets/brand-logo/logoipsum-light-5.svg',
    name: 'Brand 5',
  },
];

function BrandSlider() {
  return (
    <section>
      <div className="py-6 md:py-10">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.6, ease: 'easeInOut' }}
            className="flex flex-col gap-3"
          >
            <div className="flex justify-center text-center py-3 md:py-4 relative">
              <div className="flex items-center justify-center gap-4">
                <div className="hidden md:block h-0.5 w-40 bg-linear-to-l from-muted-foreground to-white dark:from-muted-foreground dark:to-transparent opacity-20" />
                <p className="text-sm font-normal sm:px-2 px-10 text-muted-foreground text-center">
                  Loved by 1000+ big and small brands around the worlds
                </p>
                <div className="hidden md:block h-0.5 w-40 bg-linear-to-r from-muted-foreground to-white dark:from-muted-foreground dark:to-transparent opacity-20" />
              </div>
            </div>
            {brandList && brandList.length > 0 && (
              <div className="py-4">
                <Marquee pauseOnHover className="[--duration:20s] p-0">
                  {brandList.map((brand, index) => (
                    <div key={index}>
                      <img
                        src={brand.image}
                        alt={brand.name}
                        className="w-36 h-8 mr-6 lg:mr-20 dark:hidden"
                      />
                      <img
                        src={brand.lightimg}
                        alt={brand.name}
                        className="hidden dark:block w-36 h-8 mr-12 lg:mr-20"
                      />
                    </div>
                  ))}
                </Marquee>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default BrandSlider;
