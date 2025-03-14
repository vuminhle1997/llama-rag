'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { HeartIcon } from '@heroicons/react/24/solid';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { selectFavouriteChats, useAppSelector } from '@/frontend';

const FavouritesDialog = () => {
  const favouriteChats = useAppSelector(selectFavouriteChats);
  return (
    <div className="absolute top-4 right-4 z-50">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-15 w-15 rounded-full bg-primary/10 hover:bg-primary/20"
                >
                  <HeartIcon className="h-10 w-10 text-primary text-4xl" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Favorisierte Chats</DialogTitle>
                </DialogHeader>
                <div className="mt-4 space-y-2">
                  {favouriteChats?.map(favorite => (
                    <Link
                      key={favorite.id}
                      href={`/chat/${favorite.id}`}
                      className="block p-3 border rounded-lg hover:bg-accent cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <HeartIcon className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium">{favorite.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {format(
                              new Date(favorite.last_interacted_at),
                              'dd.MM.yyyy',
                              { locale: de }
                            )}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                  {(!favouriteChats || favouriteChats.length === 0) && (
                    <p className="text-center text-muted-foreground py-4">
                      Keine favorisierten Chats vorhanden
                    </p>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </TooltipTrigger>
          <TooltipContent>
            <p>Favorisierte Chats</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export default FavouritesDialog;
