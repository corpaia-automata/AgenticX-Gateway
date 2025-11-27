import { Card } from "@/components/ui/card";

interface CommunityCardProps {
  name: string;
  cardNumber: string;
}

const CommunityCard = ({ name, cardNumber }: CommunityCardProps) => {
  return (
    <Card className="w-full max-w-md bg-gradient-to-br from-black via-gray-900 to-black border-accent/30 shadow-gold overflow-hidden">
      <div className="p-8 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <p className="text-accent text-xs font-semibold tracking-wider uppercase">
              Community Member
            </p>
            <h3 className="text-2xl font-bold text-white mt-1">Black Card</h3>
          </div>
          <div className="w-12 h-12 rounded-full bg-gradient-gold flex items-center justify-center">
            <span className="text-black font-bold text-xl">★</span>
          </div>
        </div>

        {/* Card Chip */}
        <div className="flex items-start gap-3">
          <div className="w-12 h-10 bg-gradient-gold rounded-md relative overflow-hidden">
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="absolute inset-2 border border-black/30 rounded-sm"></div>
          </div>
        </div>

        {/* Card Number */}
        <div className="space-y-1">
          <p className="text-accent/60 text-xs font-medium tracking-wider uppercase">
            Card Number
          </p>
          <p className="text-white font-mono text-sm tracking-widest">
            {cardNumber.slice(0, 8).toUpperCase()}
          </p>
        </div>

        {/* Name and Validity */}
        <div className="flex justify-between items-end">
          <div className="space-y-1">
            <p className="text-accent/60 text-xs font-medium tracking-wider uppercase">
              Member Name
            </p>
            <p className="text-white text-lg font-semibold tracking-wide">{name}</p>
          </div>
          <div className="text-right space-y-1">
            <p className="text-accent/60 text-xs font-medium tracking-wider uppercase">
              Status
            </p>
            <p className="text-accent text-sm font-bold">ACTIVE</p>
          </div>
        </div>

        {/* Bottom Accent */}
        <div className="flex justify-between items-center pt-4 border-t border-accent/20">
          <p className="text-white/40 text-xs tracking-wider">EXCLUSIVE ACCESS</p>
          <div className="flex gap-1">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="w-1 h-1 rounded-full bg-accent"></div>
            ))}
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-gold opacity-10 blur-3xl rounded-full"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary opacity-10 blur-2xl rounded-full"></div>
    </Card>
  );
};

export default CommunityCard;
