#![cfg_attr(not(feature = "std"), no_std)]

/// Edit this file to define custom logic or remove it if it is not needed.
/// Learn more about FRAME and the core library of Substrate FRAME pallets:
/// <https://docs.substrate.io/v3/runtime/frame>
pub use pallet::*;

#[cfg(test)]
mod mock;

#[cfg(test)]
mod tests;

#[cfg(feature = "runtime-benchmarks")]
mod benchmarking;

#[frame_support::pallet]
pub mod pallet {
	use frame_support::pallet_prelude::*;
	use frame_system::pallet_prelude::*;
	use frame_support::{
	  sp_runtime::traits::Hash,
	  traits::{ Randomness, Currency, tokens::ExistenceRequirement },
	  transactional
	};
	use sp_io::hashing::blake2_128;
	use scale_info::TypeInfo;
	use sp_std::{collections::vec_deque::VecDeque, prelude::*, str};
  
	#[cfg(feature = "std")]
	use frame_support::serde::{Deserialize, Serialize};
	type AccountOf<T> = <T as frame_system::Config>::AccountId;

	/// Configure the pallet by specifying the parameters and types on which it depends.
	#[pallet::config]
	pub trait Config: frame_system::Config {
		/// Because this pallet emits events, it depends on the runtime's definition of an event.
		type Event: From<Event<Self>> + IsType<<Self as frame_system::Config>::Event>;
	}

	#[repr(u8)]
	#[derive(Clone, Copy, Encode, Decode, PartialEq, RuntimeDebug, TypeInfo)]
	#[scale_info(skip_type_params(T))]
	pub enum Cell {
		Dead = 0,
		Alive = 1,
	}

	// impl Cell {
	// 	fn toggle(&mut self) {
	// 		*self = match *self {
	// 			0 => 1,
	// 			1 => 0,
	// 		};
	// 	}
	// }

	#[derive(Clone, Encode, Decode, PartialEq, RuntimeDebug, TypeInfo)]
	#[scale_info(skip_type_params(T))]
	pub struct Universe<T: Config> {
		pub width: u32,
		pub height: u32,
		pub cells: Vec<u8>,
		pub owner: AccountOf<T>,
	}

	#[pallet::pallet]
	#[pallet::generate_store(pub(super) trait Store)]
	pub struct Pallet<T>(_);

	// The pallet's runtime storage items.
	// https://docs.substrate.io/v3/runtime/storage
	#[pallet::storage]
	#[pallet::getter(fn something)]
	// Learn more about declaring storage items:
	// https://docs.substrate.io/v3/runtime/storage#declaring-storage-items
	pub type Something<T> = StorageValue<_, u32>;

	#[pallet::storage]
	#[pallet::getter(fn universe)]
	pub (super) type Universes<T: Config> = StorageMap<_, Twox64Concat, T::Hash, Universe<T>>;

	// Pallets use events to inform users when important changes are made.
	// https://docs.substrate.io/v3/runtime/events-and-errors
	#[pallet::event]
	#[pallet::generate_deposit(pub(super) fn deposit_event)]
	pub enum Event<T: Config> {
		/// Event documentation should end with an array that provides descriptive names for event
		/// parameters. [something, who]
		SomethingStored(u32, T::AccountId),
		Created(T::AccountId, T::Hash),
		Tick(T::AccountId, T::Hash),
	}

	// Errors inform users that something went wrong.
	#[pallet::error]
	pub enum Error<T> {
		/// Error names should be descriptive.
		NoneValue,
		/// Errors should have helpful documentation associated with them.
		StorageOverflow,
	}

	// Dispatchable functions allows users to interact with the pallet and invoke state changes.
	// These functions materialize as "extrinsics", which are often compared to transactions.
	// Dispatchable functions must be annotated with a weight and must return a DispatchResult.
	#[pallet::call]
	impl<T: Config> Pallet<T> {
		/// An example dispatchable that takes a singles value as a parameter, writes the value to
		/// storage and emits an event. This function must be dispatched by a signed extrinsic.
		#[pallet::weight(10_000 + T::DbWeight::get().writes(1))]
		pub fn do_something(origin: OriginFor<T>, something: u32) -> DispatchResult {
			// Check that the extrinsic was signed and get the signer.
			// This function will return an error if the extrinsic is not signed.
			// https://docs.substrate.io/v3/runtime/origins
			let who = ensure_signed(origin)?;

			// Update storage.
			<Something<T>>::put(something);

			// Emit an event.
			Self::deposit_event(Event::SomethingStored(something, who));
			// Return a successful DispatchResultWithPostInfo
			Ok(())
		}

		/// An example dispatchable that may throw a custom error.
		#[pallet::weight(10_000 + T::DbWeight::get().reads_writes(1,1))]
		pub fn cause_error(origin: OriginFor<T>) -> DispatchResult {
			let _who = ensure_signed(origin)?;

			// Read a value from storage.
			match <Something<T>>::get() {
				// Return an error if the value has not been set.
				None => Err(Error::<T>::NoneValue)?,
				Some(old) => {
					// Increment the value read from storage; will error in the event of overflow.
					let new = old.checked_add(1).ok_or(Error::<T>::StorageOverflow)?;
					// Update the value in storage with the incremented result.
					<Something<T>>::put(new);
					Ok(())
				},
			}
		}

		// ** Universe **
		#[pallet::weight(100)]
		pub fn create_universe(origin: OriginFor<T>) -> DispatchResult {
			let sender = ensure_signed(origin)?;
		
			let width = 64;
			let height = 64;

			let cells = (0..width * height)
				.map(|i| {
					if i % 2 == 0 || i % 7 == 0 {
						1
					} else {
						0
					}
				})
				.collect();

			let universe = Universe {
				width,
				height,
				cells,
				owner: sender.clone(),
			};

			let universe_id = T::Hashing::hash_of(&universe);

			<Universes<T>>::insert(universe_id, universe);

			Self::deposit_event(Event::Created(sender, universe_id));
			Ok(())
		}

		#[pallet::weight(100)]
		pub fn tick(origin: OriginFor<T>, universe_id: T::Hash) -> DispatchResult {
			// let _timer = Timer::new("Universe::tick");
	
			let sender = ensure_signed(origin)?;
			let mut universe = Self::universe(&universe_id).ok_or(<Error<T>>::NoneValue)?;

			let mut next = universe.cells.clone();
	
			for row in 0..universe.height {
				for col in 0..universe.width {
					let idx = universe.get_index(row, col);
					let cell = universe.cells[idx];
					let live_neighbors = universe.live_neighbor_count(row, col);
	
					let next_cell = match (cell, live_neighbors) {
						// Rule 1: Any live cell with fewer than two live neighbours
						// dies, as if caused by underpopulation.
						(1, x) if x < 2 => 0,
						// Rule 2: Any live cell with two or three live neighbours
						// lives on to the next generation.
						(1, 2) | (1, 3) => 1,
						// Rule 3: Any live cell with more than three live
						// neighbours dies, as if by overpopulation.
						(1, x) if x > 3 => 0,
						// Rule 4: Any dead cell with exactly three live neighbours
						// becomes a live cell, as if by reproduction.
						(0, 3) => 1,
						// All other cells remain in the same state.
						(otherwise, _) => otherwise,
					};
	
					next[idx] = next_cell;
				}
			}
	
			universe.cells = next;
			<Universes<T>>::insert(universe_id, universe);
			Self::deposit_event(Event::Tick(sender, universe_id));
			Ok(())
		}
		
	}

	impl <T: Config>Universe<T> {
		fn get_index(&self, row: u32, column: u32) -> usize {
			(row * self.width + column) as usize
		}
	
		/// Get the dead and alive values of the entire universe.
		// pub fn get_cells(&self) -> &[Cell] {
		// 	&self.cells
		// }
	
		/// Set cells to be alive in a universe by passing the row and column
		/// of each cell as an array.
		pub fn set_cells(&mut self, cells: &[(u32, u32)]) {
			for (row, col) in cells.iter().cloned() {
				let idx = self.get_index(row, col);
				self.cells[idx] = 1;
			}
		}
	
		fn live_neighbor_count(&self, row: u32, column: u32) -> u8 {
			let mut count = 0;
	
			let north = if row == 0 {
				self.height - 1
			} else {
				row - 1
			};
	
			let south = if row == self.height - 1 {
				0
			} else {
				row + 1
			};
	
			let west = if column == 0 {
				self.width - 1
			} else {
				column - 1
			};
	
			let east = if column == self.width - 1 {
				0
			} else {
				column + 1
			};
	
			let nw = self.get_index(north, west);
			count += self.cells[nw] as u8;
	
			let n = self.get_index(north, column);
			count += self.cells[n] as u8;
	
			let ne = self.get_index(north, east);
			count += self.cells[ne] as u8;
	
			let w = self.get_index(row, west);
			count += self.cells[w] as u8;
	
			let e = self.get_index(row, east);
			count += self.cells[e] as u8;
	
			let sw = self.get_index(south, west);
			count += self.cells[sw] as u8;
	
			let s = self.get_index(south, column);
			count += self.cells[s] as u8;
	
			let se = self.get_index(south, east);
			count += self.cells[se] as u8;
	
			count
		}
	}
}
