import moviesRepository from "repositories/movies-repository";
import rentalsRepository from "repositories/rentals-repository";
import usersRepository from "repositories/users-repository";
import rentalsService from "services/rentals-service";
import { faker } from "@faker-js/faker";

describe("Rentals Service Unit Tests", () => {
  it("should pass", () => {
    expect(true).toBe(true);
  });

  it("/POST createRental should fail if user has an open rental", async () => {
    jest.spyOn(usersRepository, "getById").mockImplementation((): any => {
      return {
        id: 1,
        birthDate: "2020-02-20",
      };
    });

    jest
      .spyOn(rentalsRepository, "getRentalsByUserId")
      .mockImplementationOnce((): any => {
        return [
          {
            id: 1,
            closed: false,
            date: faker.date.past(),
            endDate: faker.date.future(),
            userId: 1,
          },
        ];
      });

    const result = rentalsService.createRental({ userId: 1, moviesId: [1] });

    expect(result).rejects.toEqual({
      name: "PendentRentalError",
      message: "The user already have a rental!",
    });
  });

  it("/POST createRental shoud fail for a rental with no movies", async () => {
    jest
      .spyOn(rentalsRepository, "getRentalsByUserId")
      .mockImplementation((): any => {
        return [];
      });

    jest.spyOn(moviesRepository, "getById").mockImplementationOnce((): any => {
      return null;
    });

    const rentalInput = {
      moviesId: [15554],
      userId: 1,
    };

    const rental = rentalsService.createRental(rentalInput);

    expect(rental).rejects.toEqual({
      name: "NotFoundError",
      message: "Movie not found.",
    });
  });

  it("/POST createRental should fail for a minor age user and adult film", async () => {
    jest
      .spyOn(rentalsRepository, "getRentalsByUserId")
      .mockImplementation((): any => {
        return [];
      });

    jest.spyOn(moviesRepository, "getById").mockImplementationOnce((): any => {
      return {
        id: 1,
        adultsOnly: true,
        name: faker.person.fullName(),
      };
    });

    const rental = rentalsService.createRental({ moviesId: [1], userId: 1 });
    expect(rental).rejects.toEqual({
      name: "InsufficientAgeError",
      message: "Cannot see that movie.",
    });
  });

  it("/POST createRental should fail for a movie already rented", async () => {
    jest
      .spyOn(rentalsRepository, "getRentalsByUserId")
      .mockImplementation((): any => {
        return [];
      });

    jest.spyOn(moviesRepository, "getById").mockImplementationOnce((): any => {
      return {
        id: 2,
        adultsOnly: false,
        name: faker.person.fullName(),
        rentalId: 2,
      };
    });

    const rental = rentalsService.createRental({
      moviesId: [2],
      userId: 1,
    });

    expect(rental).rejects.toEqual({
      name: "MovieInRentalError",
      message: "Movie already in a rental.",
    });
  });

  it("/GET getRental should return a list of rentals", async () => {
    const rental1 = {
      id: faker.number.int(),
      date: faker.date.past(),
      endDate: faker.date.future(),
      userId: 1,
      closed: true,
    };

    const rental2 = {
      id: faker.number.int(),
      date: faker.date.past(),
      endDate: faker.date.future(),
      userId: 2,
      closed: true,
    };
    jest
      .spyOn(rentalsRepository, "getRentals")
      .mockImplementationOnce((): any => {
        return [rental1, rental2];
      });

    const promise = await rentalsService.getRentals();
    expect(promise).toEqual([rental1, rental2]);
  });

  it("/GET getRentalById should fail if rental does not exists", async () => {
    jest
      .spyOn(rentalsRepository, "getRentalById")
      .mockImplementationOnce((): any => {
        return null;
      });
    const promise = rentalsService.getRentalById(1);
    expect(promise).rejects.toEqual({
      name: "NotFoundError",
      message: "Rental not found.",
    });
  });

  it("/GET Get rental by id should return a rental", async () => {
    const rental1 = {
      id: faker.number.int(),
      date: faker.date.past(),
      endDate: faker.date.future(),
      userId: 1,
      closed: true,
    };

    jest
      .spyOn(rentalsRepository, "getRentalById")
      .mockImplementationOnce((): any => {
        return rental1;
      });

    const promise = await rentalsService.getRentalById(rental1.id);
    expect(promise).toEqual(rental1);
  });
});
