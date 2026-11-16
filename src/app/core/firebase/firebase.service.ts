import { Injectable, inject, InjectionToken } from '@angular/core';
import { Observable, combineLatest, merge, of, from, pipe } from 'rxjs';
import { tap, pluck, mergeMap, filter, takeUntil, skip, switchMap, map, take } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Firestore, DocumentSnapshot, serverTimestamp, sum, count, average, Timestamp, getDoc, getDocs, doc, setDoc, updateDoc, deleteDoc, docData, collection, collectionData, collectionChanges, query, where, orderBy, OrderByDirection, limit, startAt, startAfter, endAt, endBefore, DocumentChange, increment, AggregateQuerySnapshot, AggregateField, AggregateSpec, getAggregateFromServer, getCountFromServer, writeBatch, WriteBatch } from '@angular/fire/firestore';
import { Auth, user, User, signInWithPopup, signInWithCredential, signOut, linkWithPopup, linkWithCredential, fetchSignInMethodsForEmail, GoogleAuthProvider, GithubAuthProvider } from '@angular/fire/auth';
import { QueryParams, QueryOptions, AnyEntity } from '../store/app.model';
import { DatabaseService } from './database.service';

@Injectable({
  providedIn: 'root',
})
export class FirebaseService implements DatabaseService {
  private afAuth = inject(Auth);
  private firestore = inject(Firestore);
  private user$ = user(this.afAuth);

  constructor(
  ) { }

  /** Creates a unique id */
  createId(): string {
    // see https://stackoverflow.com/questions/56574593/access-firestore-id-generator-on-the-front-end?noredirect=1&lq=1
    // see https://github.com/firebase/firebase-js-sdk/blob/73a586c92afe3f39a844b2be86086fddb6877bb7/packages/firestore/src/util/misc.ts#L36
    // Alphanumeric characters
    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let autoId = '';
    for (let i = 0; i < 20; i++) {
      autoId += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return autoId;
  }

  afUser(): Observable<User> {
    return this.user$;
  }

  login(providerId, scope?: string): any {
    const provider = this.getProvider(providerId, scope);

    if (provider) {
      return signInWithPopup(this.afAuth, provider);
    } else {
      return undefined;
    }
  }

  private getProvider(providerId, scope?: string) {
    let provider;
    switch (providerId) {
      case 'google.com': {
        provider = new GoogleAuthProvider();
        break;
      }
      case 'github.com': {
        provider = new GithubAuthProvider();
        break;
      }
    }
    if (provider && scope) {
      provider.addScope(scope);
    }
    return provider;
  }

  loginLink(error) {
    fetchSignInMethodsForEmail(this.afAuth, error.email)
      .then(async (providers) => {
        const provider = this.getProvider(providers[0]);

        // This only handles if you already had an OAuthProvider user and are now signing in with email for first time
        // Thus, it starts by signing into the OAuthProvider account with popup, then linking it together
        // If we want to do the reverse, need to have them sign in with email
        // If we want to link two OAuth, then see https://firebase.google.com/docs/auth/web/account-linking#web-modular-api_6
        signInWithPopup(this.afAuth, provider).then((result) => {
          const credential = provider.credentialFromResult(result);
          signInWithCredential(this.afAuth, credential).then((result2) => {
            linkWithCredential(result2.user, error.credential);
          });
          console.log('Successfully linked');
        });
      });
  }

  logout() {
    return signOut(this.afAuth);
  }

  streamEntity<T>(collectionName: string, id: string) {
    const docRef = doc(this.firestore, `${collectionName}/${id}`);
    return docData(docRef as any) as unknown as Observable<T>;
  }

  streamEntities<T>(collectionName, queryParams, queryOptions?) {
    const collectionRef = collection(this.firestore, collectionName);
    if (queryParams.length === 0 && (!queryOptions || Object.keys(queryOptions).length === 0)) {
      return collectionData(collectionRef) as Observable<T[]>;
    } else {
      return collectionData(
        query(collectionRef, ...this.constructQueryListRefMod(queryParams, queryOptions)),
      ) as Observable<T[]>;
    }
  }

  streamEntitiesChanges<T>(collectionName, queryParams, queryOptions?): Observable<{
    type: string;
    docData: T;
  }[]> {
    let stateChangeObs$;
    const collectionRef = collection(this.firestore, collectionName);

    if (queryParams.length === 0 && (!queryOptions || Object.keys(queryOptions).length === 0)) {
      stateChangeObs$ = collectionChanges(collectionRef);
    } else {
      stateChangeObs$ = collectionChanges(
        query(collectionRef, ...this.constructQueryListRefMod(queryParams, queryOptions)),
      ) as unknown as Observable<DocumentChange<T>[]>;
    }

    return stateChangeObs$.pipe(
      map((changes: DocumentChange<T>[]) => {
        return changes.map((dc) => ({
          type: dc.type,
          docData: dc.doc.data(),
        }));
      }),
    );
  }

  private constructQueryListRefMod(queryParams, queryOptions?) {
    // Convert queryParams to queryArray
    // Note: firestore supports setting and querying for null, but not
    // undefined. We filter out cases where the value is undefined
    // to protect against cases when people are doing a nested query
    // and some entity does not have a particular field, e.g.
    // [['__hashtagId', '==', q.__hashtagId]] when __hashtagId is
    // an optional parameter
    const queryArray = queryParams
      .filter((query) => query[2] !== undefined)
      .map((query) => {
        const [prop, comp, val] = query;
        return where(prop, comp, val);
      });

    // Add queryOptions to queryArray
    if (queryOptions) {
      Object.keys(queryOptions).forEach((queryKey) => {
        switch (queryKey) {
          case 'orderBy': {
            if (Array.isArray(queryOptions.orderBy)) {
              queryArray.push(orderBy(queryOptions.orderBy[0], queryOptions.orderBy[1] as OrderByDirection));
            } else {
              queryArray.push(orderBy(queryOptions.orderBy));
            }
            break;
          }
          case 'limit':
            queryArray.push(limit(queryOptions.limit));
            break;

          case 'startAt':
            queryArray.push(startAt(queryOptions.startAt));
            break;

          case 'startAfter':
            queryArray.push(startAfter(queryOptions.startAfter));
            break;

          case 'endAt':
            queryArray.push(endAt(queryOptions.endAt));
            break;

          case 'endBefore':
            queryArray.push(endBefore(queryOptions.endBefore));
            break;

          default:
            break;
        }
      });
    }
    return queryArray;
  }

  async getEntity<T>(collectionName: string, id: string) {
    const docRef = doc(this.firestore, `${collectionName}/${id}`);
    const docSnap = await getDoc(docRef) as DocumentSnapshot<T, T>;

    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      return null;
    }
  }

  async getEntities<S>(
    collectionName: string,
    queryParams: [string, string, any][],
    queryOptions?: { [index: string]: any },
  ): Promise<S[]> {
    const collectionRef = collection(this.firestore, collectionName);
    let querySnapshot;
    if (queryParams.length === 0 && (!queryOptions || Object.keys(queryOptions).length === 0)) {
      querySnapshot = await getDocs(collectionRef);
    } else {
      querySnapshot = await getDocs(
        query(collectionRef, ...this.constructQueryListRefMod(queryParams, queryOptions)),
      );
    }
    const entities = querySnapshot.docs.map((doc) => doc.data());
    return entities;
  }

  async count(
    collectionName: string,
    queryParams: QueryParams,
    queryOptions?: QueryOptions,
  ): Promise<number> {
    const collectionRef = collection(this.firestore, collectionName);
    let querySnapshot;
    if (queryParams.length === 0 && (!queryOptions || Object.keys(queryOptions).length === 0)) {
      querySnapshot = await getCountFromServer(collectionRef);
    } else {
      querySnapshot = await getCountFromServer(
        query(collectionRef, ...this.constructQueryListRefMod(queryParams, queryOptions)),
      );
    }
    return querySnapshot.data().count;
  }

  /*
   * Example of aggregateSpec
   * {
   *   countOfDocs: ['count'],
   *   totalPopulation: ['sum', 'population'],
   *   averagePopulation: ['average', 'population'],
   * }
   */
  async aggregate<S extends { [k: string]: number }>(
    collectionName: string,
    queryParams: QueryParams,
    queryOptions: QueryOptions,
    aggregateParams: { [K in keyof S]: [string] | [string, string] },
  ): Promise<{ [K in keyof S]: number }> {
    const collectionRef = collection(this.firestore, collectionName);
    let querySnapshot;

    const aggregateSpec: AggregateSpec = {};

    for (const key in aggregateParams) {
      if (key === 'count') {
        aggregateSpec[key] = count();
      } else if (key === 'sum') {
        aggregateSpec[key] = sum(aggregateParams[key][1]);
      } else if (key === 'average') {
        aggregateSpec[key] = average(aggregateParams[key][1]);
      }
    }

    if (queryParams.length === 0 && (!queryOptions || Object.keys(queryOptions).length === 0)) {
      querySnapshot = await getAggregateFromServer(collectionRef, aggregateSpec);
    } else {
      querySnapshot = await getAggregateFromServer(
        query(collectionRef, ...this.constructQueryListRefMod(queryParams, queryOptions)),
        aggregateSpec,
      );
    }
    return querySnapshot.data();
  }

  async addEntity(
    collectionName: string,
    entity: AnyEntity,
    batch?: WriteBatch,
  ) {
    const docRef = doc(this.firestore, `${collectionName}/${entity.__id}`);
    const entityFinal = Object.assign({}, entity, {
      _createdAt: serverTimestamp(),
      _updatedAt: serverTimestamp(),
      _deleted: false,
    });
    if (batch) {
      return batch.set(docRef, entityFinal);
    } else {
      return setDoc(docRef, entityFinal);
    }
  }

  async updateEntity(
    collectionName: string,
    id: string,
    changes: Partial<AnyEntity>,
    batch?: WriteBatch,
  ) {
    const docRef = doc(this.firestore, `${collectionName}/${id}`);
    const changesFinal = Object.assign({}, changes, {
      _updatedAt: serverTimestamp(),
    });
    if (batch) {
      return batch.update(docRef, changesFinal);
    } else {
      return updateDoc(docRef, changesFinal);
    }
  }

  async removeEntity(
    collectionName: string,
    id: string,
    batch?: WriteBatch,
  ) {
    const docRef = doc(this.firestore, `${collectionName}/${id}`);
    // we do soft deletes from client side
    const changes = {
      _updatedAt: serverTimestamp(),
      _deleted: true,
    };
    if (batch) {
      return batch.update(docRef, changes);
    } else {
      return updateDoc(docRef, changes);
    }
  }

  async incrementEntityField(collectionName, id, field, delta) {
    const docRef = doc(this.firestore, collectionName, id);
    const changes = {};
    changes[field] = increment(delta);

    return updateDoc(docRef, Object.assign({}, changes, {
      _updatedAt: serverTimestamp(),
    }));
  }
}
